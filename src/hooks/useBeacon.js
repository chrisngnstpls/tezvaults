import { useCallback, useState, useEffect } from "react";
import constate from "constate";
import { BeaconWallet } from "@taquito/beacon-wallet";
import { MichelCodecPacker, MichelsonMap, TezosToolkit } from "@taquito/taquito";



// TESTNET
// export const contractAddress = "KT1QwVmmYNp3Ke2JkNr2eaAdYyAJFusbi7yH";

// const DEFAULT_NETWORK = {
//   id: "ithacanet",
//   nextNetworkIndex: 1,
//   name: "Ithacanet",
//   type: "testnet",
//   rpcBaseURL: "https://ithacanet.smartpy.io",
// };

//MAINNET
// export const contractAddress = process.env.REACT_APP_VESTING_CONTRACT || "KT1XCayigssNGqGUuFs7oBiRobTksyJuHhnT";

// const DEFAULT_NETWORK = {
//   id: "mainnet",
//   nextNetworkIndex: 1,
//   name: "Mainnet",
//   type: "main",
//   rpcBaseURL: "https://mainnet-tezos.giganode.io",
// };
// GHOSTNET
export const contractAddress = process.env.REACT_APP_MANAGER_CONTRACT || "KT1Jcnv1koh2cUiaEubUK6y2ZRHdV9GZhQtG";

const DEFAULT_NETWORK = {
    id: "ghostnet",
    nextNetworkIndex: 1,
    name: "Ghostnet",
    type: "test",
    rpcBaseURL: "	https://rpc.ghostnet.teztnets.xyz"
};

class LambdaViewSigner {
  async publicKeyHash() {
    const acc = await wallet.client.getActiveAccount();
    if (!acc) throw new Error("Not connected");
    return acc.address;
  }
  async publicKey() {
    const acc = await wallet.client.getActiveAccount();
    if (!acc) throw new Error("Not connected");
    return acc.publicKey;
  }
  async secretKey() {
    throw new Error("Secret key cannot be exposed");
  }
  async sign() {
    throw new Error("Cannot sign");
  }
}

const options = {
  name: "Madfish Vesting",
  iconUrl: "https://tezostaquito.io/img/favicon.png",
};

const michelEncoder = new MichelCodecPacker();

const Tezos = new TezosToolkit(DEFAULT_NETWORK.rpcBaseURL);
const wallet = new BeaconWallet(options, { forcePermission: true });
Tezos.setWalletProvider(wallet);
Tezos.setSignerProvider(new LambdaViewSigner());
Tezos.setPackerProvider(michelEncoder);

export const [UseBeaconProvider, useBeacon] = constate(() => {
  const [pkh, setUserPkh] = useState('');
  const [contract, setContract] = useState(null);
  const [storage, setStorage] = useState(null);


  const connect = useCallback(async () => {
    await wallet.disconnect();
    await wallet.clearActiveAccount();
    await wallet.requestPermissions({
      network: { type: DEFAULT_NETWORK.id },
    });
    Tezos.setWalletProvider(wallet);
    Tezos.setRpcProvider(DEFAULT_NETWORK.rpcBaseURL);
    const activeAcc = await wallet.client.getActiveAccount();
    if (!activeAcc) {
      throw new Error("Not connected");
    }
    setUserPkh(await wallet.getPKH());
  }, []);

  const disconnect = useCallback(async () => {
    await wallet.disconnect();
    await wallet.clearActiveAccount();
    Tezos.setWalletProvider(wallet);
    setUserPkh(undefined);
  }, []);

  const loadContract = useCallback(async () => {
    const contract = await Tezos.contract.at(contractAddress);
    setContract(contract);
    const storage = await contract.storage();
    setStorage(storage);


  }, []);


  useEffect(() => {
    loadContract();
  }, [loadContract]);



  return {
    connect,
    disconnect,
    isConnected: !!pkh,
    Tezos,
    wallet,
    pkh,
    contract,
    storage,
    contractAddress
  };
});

export default useBeacon;
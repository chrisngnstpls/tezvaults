import React, { useEffect, useState, useCallback } from "react";
import BigNumber from "bignumber.js";
import useBeacon, { contractAddress } from "../hooks/useBeacon";
import { Button } from "./Button";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { validateAddress } from "@taquito/utils"
import { Divider, Typography, Card, CardActions, CardContent, Table, TableBody, TableCell,TableContainer, TableHead,TableRow, Paper, Grid, Unstable_Grid2 } from "@mui/material";
import { InfoTable } from "./InfoTable";




export const CreateVault = () => {
  const [value, setValue] = useState("");
  const [errorJSON, setJSONError] = useState(null);
  const { contract, storage, pkh, Tezos, wallet } = useBeacon();
  const [vault, setVault ] = useState(null)
  const [vaultContract, setVaultContract] = useState(null);
  const [vaultStorage, setVaultStorage] = useState(null)
  const [vaultShares, setVaultShares] = useState(null)
  const [unlockTime, setUnlockTime] = useState(null)
  const [penaltyFactor, setPenaltyFactor] = useState(null)
  const [penaltyFunds, setPenaltyFunds] = useState(null)
  const [managerTotalBalance, setManagerTotalBalance] = useState(null)
  const [managerTotalShares, setManagerTotalShares] = useState(null)
  const [claimable, setClaimable] = useState(null)





  const [{ asset, assetId, amount, receiver, deadline }, setFormValue] =
    useState({
      asset: "",
      assetId: "",
      amount: "",
      receiver: "",
      deadline: "",
    });

  const handleChange = (e) => {
    handleFormValue(e.target.name, e.target.value);
  };

  const handleFormValue = (name, value) => {
    setFormValue((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeTextArea = (e) => {
    setJSONError(null);
    setValue(e.target.value);
    try {
      JSON.parse(e.target.value);
    } catch (e) {
      setJSONError(`Invalid JSON: ${e.message}`);
    }
  };

  const handleDistributeForm = () =>
    makeRpcCall([{ asset, assetId, amount, receiver, deadline }]);

  const handleDistributeJSON = () => {
    if (errorJSON) {
      return;
    }
    const params = JSON.parse(value);
    if (Array.isArray(params)) {
      makeRpcCall(params);
    } else {
      makeRpcCall([params]);
    }
  };
  
  const handleClaim = async () => {
    try{

      const batch = await Tezos.wallet.batch()
      .withContractCall(vaultContract.methods.claim())
      .send()
    }catch(err){
      console.log(err)
    }
  }

  const handleWithdraw = async () => {
    let today  = Date.now()
    let expiration = new Date(unlockTime)

    let diff = expiration - today
    if(diff < 0) {
      try{
        const batch = await Tezos.wallet.batch()
        .withContractCall(vaultContract.methods.withdrawAll())
        .send()
      }catch(err){
        console.log(err)
      }

    } else if(diff >0){
      try{
        const batch = await Tezos.wallet.batch()
        .withContractCall(vaultContract.methods.withdrawAllWithPenalty())
        .send()
      } catch(err){
        console.error(err)
      }
    }
    console.log(diff)
  }

  const readStorage = async () => {
    try {
      //const activeAcc = await wallet.getActiveAccount();
      //console.log('active', activeAcc)
      if (storage !== null) { 
        const _storage = await contract.storage()
        const details = await _storage.active_vault_owners.get(pkh)
        const _managerTotalBalance = await new BigNumber(_storage.total_balance)
        const _managerTotalShares = await new BigNumber(_storage.total_shares)
        setManagerTotalBalance(_managerTotalBalance.toNumber())
        setManagerTotalShares(_managerTotalShares.toNumber())
        setVault(details[1])
        if(vault !== null){
          const _vaultContract = await Tezos.contract.at(details[1])
          // console.log(await _vaultContract)
          // console.log(contract)
          setVaultContract(_vaultContract)
          const _vaultStorage = await vaultContract.storage()
          setVaultStorage(_vaultStorage)
          if (vaultStorage !== null){
            setUnlockTime(vaultStorage.unlock_time)
            const shares = await new BigNumber(vaultStorage.shares)
            const funds = await new BigNumber(storage.penalty_funds_sum)
            const factor = await new BigNumber(vaultStorage.penalty_factor)
            setPenaltyFactor(factor.toNumber())
            setPenaltyFunds(funds.toNumber()) 
            setVaultShares(shares.toNumber())
            //const _penaltyFunds = new BigNumber(storage.penalty_funds_sum)
            //console.log(vaultStorage.penalty_factor)
            //setPenaltyFunds(_penaltyFunds.toString)
            let _toClaim = await vaultShares * (managerTotalBalance / managerTotalShares)
            setClaimable(_toClaim)

          }
        }
      }



    } catch(err) {
      console.log(err)
    }
  }
  useEffect(() => {
    readStorage()
  },[readStorage])


  const calculateWithdraw = async () => {
    try{
      /***
       * vault balance + claimable = (vault_shares * total_balance) / total_shares
       * claimable_balance = (vault_balance + claimable) - current_vault_bal
       */
    } catch(err){
      console.error(err)
    }
  }

  const handleCreateVault = async () => {
    try {
      console.log(storage)
      // const batch = await Tezos.wallet.batch()
      //   .withContractCall(contract.methods.createVault())
      // batch.send()
    } catch(err){
      console.log(err)
    }
    
  }

  const handleLockFunds = async () => {
    try{
      Tezos.wallet.transfer({to:vault, amount:amount}).send()
    }catch(err){
      console.log(err)
    }
  }

  const handleDelegate = async () => {
    // try{
    //   if(validateAddress(receiver)){
    //     Tezos.wallet.batch().withContractCall(vault.methods.setDelegate({receiver})).send()
    //   } else {
    //     Tezos.wallet.batch().withContractCall(vault.methods.setDelegate()).send()
    //   }
    // }catch(err){
    //   console.error(err)
    // }
    try{
      const vaultContract  = await Tezos.wallet.at(vault)
      const batch = await Tezos.wallet.batch()
      .withDelegation(vaultContract.methods.setDelegate(vault))
      .send()
    } catch(err){
      console.log(err)
    }
  }

  const makeRpcCall = async (opParams) => {
    try {
      let batchOp = Tezos.wallet.batch();
      for (var i = 0; i < opParams.length; i++) {
        batchOp = await makeParams(opParams[i], batchOp);
      }
      batchOp.send();
    } catch (e) {
      console.log("error in makeRpcCall", e);
    }
  };

  const makeParams = async (
    { asset, assetId, amount, receiver, deadline },
    batchOp
  ) => {
    const isFa2 = !!assetId || assetId === "0";
    const isTez = asset === "tz";
    const assetParam = isFa2
      ? { fa2: { token: asset, id: Number(assetId) } } //{ token: asset, id: new BigNumber(assetId) } //
      : isTez
      ? { tez: null }
      : { fa12: asset };

    const amountParam = new BigNumber(amount);
    const deadlineParam = new BigNumber(
      new Date(deadline).getTime()
    ).dividedToIntegerBy(1000);
    const tx_prm = {
      asset: assetParam,
      amount: amountParam,
      receiver: receiver,
      deadline: deadlineParam,
    };
    const vestingParams = contract.methodsObject.start_vesting(tx_prm);
    try {
      if (isFa2) {
        const tokenContract = await Tezos.contract.at(asset);
        const addOperatorParams = tokenContract.methods.update_operators([
          {
            add_operator: {
              owner: pkh,
              operator: contractAddress,
              token_id: assetId,
            },
          },
        ]);
        const removeOperatorParams = tokenContract.methods.update_operators([
          {
            remove_operator: {
              owner: pkh,
              operator: contractAddress,
              token_id: assetId,
            },
          },
        ]);
        batchOp = batchOp
          .withContractCall(addOperatorParams)
          .withContractCall(vestingParams)
          .withContractCall(removeOperatorParams);
      } else if (isTez) {
        const vestingParamsTez = contract.methodsObject
          .start_vesting({
            ...tx_prm,
            amount: new BigNumber(amountParam).shiftedBy(6),
          })
          .toTransferParams({ amount: amountParam });
        batchOp = batchOp.withTransfer(vestingParamsTez);
      } else {
        const tokenContract = await Tezos.contract.at(asset);
        const approveParams = tokenContract.methods.approve(
          contractAddress,
          amount
        );
        batchOp = batchOp
          .withContractCall(approveParams)
          .withContractCall(vestingParams);
      }
      return batchOp;
    } catch (e) {
      console.log(e);
    }
  };


  if (vaultStorage != null){

    return (
      <section>
        <div className="section-content">
          <InfoTable 
            name={vault}
            timer={unlockTime}
            balance={penaltyFactor}
            totalClaimable={claimable}
            fromPenalties='0'
          />
          <Divider />
          <Grid style={{padding:'10px'}} container rowSpacing={0}>
          <Card sx={{minWidth:250}}>
            <CardContent>
              <Typography sx={{fontSize:14}} color="text.secondary" gutterBottom>
                Lock funds
              </Typography>
                <input
                        name="amount"
                        value={amount}
                        placeholder={"amount"}
                        onChange={handleChange}
                />
                <CardActions>
                <Button
                  disabled={vault===''}
                  onClick={handleLockFunds}
                  className="distribute-button"
                  >
                  Lock funds
                </Button>
                </CardActions>
            </CardContent>
          </Card>
          <Card sx={{minWidth:250}}>
            <CardContent>
              <Typography sx={{fontSize:14}} color="text.secondary" gutterBottom>
                Delegate
              </Typography>
              <input
                      name="receiver"
                      value={receiver}
                      placeholder={"receiver"}
                      onChange={handleChange}
                />
                <CardActions>
                <Button
                      disabled={vault===''}
                      onClick={handleDelegate}
                      className="distribute-button"
                      >
                      Delegate
                </Button>
                </CardActions>
            </CardContent>
          </Card>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>First</TableCell>
                  <TableCell> Second </TableCell>
                  <TableCell> Third </TableCell>
                  <TableCell> Fourth </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Button
                      disabled={vault!==null}
                      onClick={handleCreateVault}
                      className="distribute-button"
                      >
                      Create Vault
                    </Button>                    
                  </TableCell>
                  <TableCell>
                    <Button
                    //disabled={storage && pkh !== storage.admin}
                    onClick={handleClaim}
                    className="distribute-button"
                    >
                    Claim all
                    </Button>                    
                  </TableCell>
                  <TableCell>
                    <Button
                    //disabled={storage && pkh !== storage.admin}
                    //onClick={}
                    className="distribute-button"
                    >
                    Storage
                    </Button>
                  </TableCell>
                  <TableCell>
                  <Button
                    //disabled={storage && pkh !== storage.admin}
                    onClick={handleWithdraw}
                    className="distribute-button"
                    >
                    Withdraw
                    </Button>                    
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      </section>
    );
  } else {
    return (
      <section>
        <div>
          Do the login
        </div>
      </section>
    )
  }
};
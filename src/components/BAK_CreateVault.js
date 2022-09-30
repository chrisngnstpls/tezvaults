import React, { useEffect, useState, useCallback } from "react";
import BigNumber from "bignumber.js";
import useBeacon, { contractAddress } from "../hooks/useBeacon";
import { Button } from "./Button";
import { MichelsonMap, TezosToolkit } from "@taquito/taquito";
import { validateAddress } from "@taquito/utils"
import { Divider, Typography, Card, CardActions, CardContent, Table, TableBody, TableCell,TableContainer, TableHead,TableRow, Paper, Grid, Unstable_Grid2 } from "@mui/material";
import { InfoTable } from "./InfoTable";
import { FirstTime } from "./FirstTime";
import axios, { Axios } from "axios";




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
  const [remainingTime, setRemainingTime] = useState(null)
  const [maybeRefresh, setMaybeRefresh] = useState(false)
  const [res, setRes] = useState(null)

  const VAULT_URL = `https://api.ghostnet.tzkt.io/v1/contracts/${vault}/storage`
  const MANAGER_URL = `https://api.ghostnet.tzkt.io/v1/contracts/${contract}/storage`
  
  var one_day=1000*60*60*24;



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

  const readVaultStorage = async () => {
    axios.get(VAULT_URL)
    .then((response) => {
      const _res = response.data

      console.log(_res.penalty_factor)
    })
    .catch(err => console.error(err))
  }
  const readManagerStorage = async () => {
    axios.get(MANAGER_URL)
    .then((response) => {
      const _res = response.data
      console.log(_res)
    })
    .catch(err => console.error(err))
  }

  
  const handleClaim = async () => {
    try{

      const batch = await Tezos.wallet.batch()
      .withContractCall(vaultContract.methods.claim())
      let _op = await batch.send()
      await _op.confirmation().then(readStorage())
    }catch(err){
      console.log(err)
    }
  }

  const handleWithdraw = async () => {
    let today  = Date.now()
    let expiration = new Date(await unlockTime)

    let diff = expiration - today
    if(diff < 0) {
      try{
        const batch = await Tezos.wallet.batch()
        .withContractCall(vaultContract.methods.withdrawAll())
        const op = await batch.send()
        await op.confirmation().then((conf) => {
          console.log('withdrawal confirmed :', conf)
          readStorage()
          setMaybeRefresh(true)
        })
      }catch(err){
        console.log(err)
      }

    } else if(diff >0){
      try{
        const batch = await Tezos.wallet.batch()
        .withContractCall(vaultContract.methods.withdrawAllWithPenalty())
        const op = await batch.send()
        await op.confirmation().then(async (conf) => {
          console.log('penalty withdrawal confirmed :', conf)
          await readStorage()
          setMaybeRefresh(true)
        })
      } catch(err){
        console.error(err)
      }
    }
    console.log(diff)
  }


  useEffect(() => {
    const setTimers = async () => {
      try{
        const end = new Date(unlockTime)
        const now = Date.now()
        let remaining = Math.abs((end - now)/one_day).toFixed(1)
        console.log(remaining)
        setRemainingTime(await remaining)
      }catch(err){
        console.log(err)
      }
    }
    const interval = setInterval(() => {
      setTimers()
    },5000)
    return () => clearInterval(interval)
  },[remainingTime])


  const loadManagerData = async () => {
    try{
      if (storage !== null){
        const _storage = await contract.storage()
        const details = await _storage.active_vault_owners.get(pkh)
        const _managerTotalBalance = await new BigNumber(_storage.total_balance)
        const _managerTotalShares = await new BigNumber(_storage.total_shares)
        setManagerTotalBalance(_managerTotalBalance.toNumber())
        setManagerTotalShares(_managerTotalShares.toNumber())
        setVault(details[1])
      }

    }catch(err){
      console.error(err)
    }
  }




  const loadVaultData = async () => {
    try{
      if(vault !== null){
        const _vaultContract = await Tezos.contract.at(vault)
        setVaultContract(_vaultContract)
      }
    }catch(err){
      console.error(err)
    }
  }

  const loadVaultStorage = async () => {
    try{
      if(vaultContract !== null){
        
        const _vaultStorage = await vaultContract.storage()
        setVaultStorage(await _vaultStorage)
        setUnlockTime(await vaultStorage.unlock_time)
        const shares = new BigNumber(await vaultStorage.shares)
        const funds =  new BigNumber(await storage.penalty_funds_sum)
        const factor = new BigNumber(await vaultStorage.penalty_factor)
        setPenaltyFactor(factor.toNumber())
        setPenaltyFunds(funds.toNumber()) 
        setVaultShares(shares.toNumber())
      }
    }catch(err){
      console.error(err)
    }
  }
  const readStorage = async () => {
    try{
      await loadManagerData()
      await loadVaultData()
      await loadVaultStorage()
      await calculateWithdraw()
    }catch(err){
      console.error(err)
    }
  }
  // const readStorage = async () => {
  //   try {
  //     //const activeAcc = await wallet.getActiveAccount();
  //     //console.log('active', activeAcc)
  //     if (storage !== null) { 

  //       const _storage = await contract.storage()
  //       const details = await _storage.active_vault_owners.get(pkh)
  //       const _managerTotalBalance = await new BigNumber(_storage.total_balance)
  //       const _managerTotalShares = await new BigNumber(_storage.total_shares)
  //       setManagerTotalBalance(_managerTotalBalance.toNumber())
  //       setManagerTotalShares(_managerTotalShares.toNumber())
  //       setVault(details[1])
  //       if(vault !== null){
  //         const _vaultContract = await Tezos.contract.at(details[1])
  //         // console.log(await _vaultContract)
  //         // console.log(contract)
  //         setVaultContract(await _vaultContract)
  //         if(vaultContract !== null){
  //           const _vaultStorage = await vaultContract.storage()
  //           setVaultStorage(_vaultStorage)
  //           if (vaultStorage !== null){
  //             setUnlockTime(vaultStorage.unlock_time)
  //             const shares = await new BigNumber(vaultStorage.shares)
  //             const funds = await new BigNumber(storage.penalty_funds_sum)
  //             const factor = await new BigNumber(vaultStorage.penalty_factor)
  //             setPenaltyFactor(factor.toNumber())
  //             setPenaltyFunds(funds.toNumber()) 
  //             setVaultShares(shares.toNumber())
  //             calculateWithdraw()

  
  //           } else {
  //             console.log('waiting for vault storage')
  //           }     
  //         } else {
  //           console.log('waiting for vault')
  //         }

  //       }
  //     } else {
  //       console.log('waiting...')
  //     }
  //   } catch(err) {
  //     console.log(err)
  //   }
  // }

  const calculateWithdraw = async () => {
    try{
      console.log(vaultShares, managerTotalBalance, managerTotalShares)
      if((vaultShares !== null) && (managerTotalBalance!== null) &&( managerTotalShares !== null)){
        const claimables = (await vaultShares * await managerTotalBalance) / await managerTotalShares
        console.log('totalClaimables : ', claimables)
        setClaimable(claimables)
      } else {
        console.log('waiting for claimables')
      }
      
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
      const batch = await Tezos.wallet.batch().withTransfer({to:vault, amount:amount})
      const op = await batch.send()
      await op.confirmation().then((conf)=>{
        console.log('confirmed transaction to vault : ', conf)
        if(conf.completed == true){
          console.log('lock success')
        } else {
          console.log('lock failed')
        }
      })
      
    }catch(err){
      console.log(err)
    }
  }

  const handleDelegate = async () => {
    try{
      const vaultContract  = await Tezos.wallet.at(vault)
      const batch = await Tezos.wallet.batch()
      .withDelegation(vaultContract.methods.setDelegate(vault))
      .send()
    } catch(err){
      console.log(err)
    }
  }

  useEffect(() => {
    if((vault == null) || (claimable == null) || (unlockTime == null)){
      readStorage()
    }
  },[readStorage])

  // useEffect(() => {
  //   if(maybeRefresh == true){
  //     const update = async() => {
  //       console.log('insideuseffect', maybeRefresh)
  //       await readStorage().then(calculateWithdraw().then(setMaybeRefresh(true)))
  //     }
  //     update()
  //   }

  // },[maybeRefresh])

  if ((wallet != null) && (vaultStorage != null)){

    return (
      <section>
        <div className="section-content">
          <InfoTable 
            name={vault}
            timer={remainingTime}
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
                    onClick={readVaultStorage}
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
  } else if (pkh !== '' && vault == null) {
    return (
      <section>
        <div>
          <FirstTime />
        </div>
      </section>
    )
  } else {
    return (
      <section>
        <div>Do logins plz</div>
      </section>
    )


  }
};
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



  useEffect(() => {
    if((vault == null) || (claimable == null) || (unlockTime == null)){
      
    }
  },[readStorage])



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
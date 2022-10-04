import React, { useEffect, useState } from "react";

import useBeacon, { contractAddress } from "../hooks/useBeacon";
import { Button } from "./Button";

import { validateAddress } from "@taquito/utils"
import { Divider, Typography, Card, CardActions, CardContent, Grid, Box } from "@mui/material";
import { InfoTable } from "./InfoTable";
import { FirstTime } from "./FirstTime";
import { Topbar } from "./Topbar";
import { LandingCard } from "./LandingCard";
import axios from "axios";
import MessageBar  from "./MessageBar";

//meaningless comment



export const CreateVault = () => {
  const [value, setValue] = useState("");
  const [errorJSON, setJSONError] = useState(null);
  const { contract, storage, pkh, Tezos, wallet,contractAddress } = useBeacon();
  const [vault, setVault ] = useState(null)
  const [vaultBalance, setVaultBalance] = useState(null)
  const [vaultContract, setVaultContract] = useState(null);
  const [vaultStorage, setVaultStorage] = useState(null)
  const [vaultShares, setVaultShares] = useState(null)
  const [unlockTime, setUnlockTime] = useState(null)
  const [penaltyFactor, setPenaltyFactor] = useState(null)
  const [penaltyFunds, setPenaltyFunds] = useState(null)
  const [managerTotalBalance, setManagerTotalBalance] = useState(null)
  const [managerTotalShares, setManagerTotalShares] = useState(null)
  const [claimable, setClaimable] = useState(null)
  const [userMessage, setUserMessage] = useState('')
  const [remainingTime, setRemainingTime] = useState(null)



  // const VAULT_URL = `https://api.ghostnet.tzkt.io/v1/contracts/${vault}/storage`
  // const MANAGER_URL = `https://api.ghostnet.tzkt.io/v1/contracts/${contractAddress}/storage`
  // const VAULT_BALANCE_URL = `https://api.ghostnet.tzkt.io/v1/accounts/${vault}/balance`
  
  
  const VAULT_URL = `https://api.kathmandunet.tzkt.io/v1/contracts/${vault}/storage`
  const MANAGER_URL = `https://api.kathmandunet.tzkt.io/v1/contracts/${contractAddress}/storage`
  const VAULT_BALANCE_URL = `https://api.kathmandunet.tzkt.io/v1/accounts/${vault}/balance`

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
    if(contract!==null){
      try{
        const _storage = await contract.storage()
        const details = await _storage.active_vault_owners.get(pkh)

        if(details){
          setVault(details[1])
        } else {
          setVault(null)
        }

      }catch(err){
        console.error(err)
      }
    }
    if(vault !== null){
      axios.get(VAULT_URL)
      .then((response) => {
        
        const _res = response.data

        setVaultStorage(_res.data)
        setVaultShares(_res.shares)
        setUnlockTime(_res.unlock_time)
        axios.get(VAULT_BALANCE_URL).then((balance_response) =>{
          let _balance = balance_response.data
          setVaultBalance(_balance / 1000000)
        })

      })
      .catch(err => console.error(err))
    }

  }
  const readManagerStorage = async () => {
    if(contract!==null){
      
      axios.get(MANAGER_URL)
      .then((response) => {
        const _res = response.data
        // console.log(
        //   _res.total_balance,
        //   _res.total_shares,
        //   _res.penalty_factor
        // )
        setManagerTotalBalance(_res.total_balance / 1000000)
        setManagerTotalShares(_res.total_shares)
        setPenaltyFactor(_res.penalty_factor)
        setPenaltyFunds(_res.penalty_funds_sum)
      })
      .catch(err => console.error(err))
    }

  }

  
  const handleClaim = async () => {
    try{
      setUserMessage('')
      const batch = await Tezos.wallet.batch()
      .withContractCall(vaultContract.methods.claim())
      let _op = await batch.send()
      await _op.confirmation().then((conf) => {
        if(conf.completed === true){
          setUserMessage('Claim success!')
        } else {
          setUserMessage('Claim failed!')
        } 
      })
    }catch(err){
      console.log(err)
    }
  }


  const handleLockFunds = async () => {
    try{
      setUserMessage('')
      const batch = await Tezos.wallet.batch().withTransfer({to:vault, amount:amount})
      const op = await batch.send()
      await op.confirmation().then((conf)=>{
        console.log('confirmed transaction to vault : ', conf);
        if(conf.completed === true){
          //setUserMessage('Lock complete!')
          
          setUserMessage('Lock Success!')
        } else {
          setUserMessage('Lock failed!')
        }
      })
      
    }catch(err){
      console.log(err)
    }
  }

  const handleDelegate = async () => {
    try{
      setUserMessage('')
      const vaultContract  = await Tezos.wallet.at(vault)
      if (receiver.length>0){
        let verification = validateAddress(receiver)
        if(verification === 3){
          const batch = await Tezos.wallet.batch()
          .withContractCall(vaultContract.methods.setDelegate(receiver))
          const op = await batch.send()
          const _confirm = op.confirmation().then((conf) => {
            if(conf.completed === true){
              setUserMessage('Delegation Success!');
              console.log('delegation success', conf);
            } else {
              setUserMessage('Delegation Failed!');
            }
          })

        }
      } else if (receiver.length === 0){
        const batch = await Tezos.wallet.batch().withContractCall(vaultContract.methods.setDelegate())
        const op = await batch.send()
        const _confirm = op.confirmation().then((conf) => {
          if(conf.completed === true){
            setUserMessage('Undelegation Success!');
          } else {
            setUserMessage('Undelegation Failed!');
          }

        })
      }
    } catch(err){
      console.log(err)
    }
  }
  const calculateTime = async () => {
    try {
      if(unlockTime!==null){
        let today = Date.now()
        let expiration = await new Date(unlockTime)
        let diff = (expiration - today)
        if(diff < 0 ){
          //console.log('expired', diff )
          let exp = (diff/one_day).toFixed(2)
          setRemainingTime('Vault Unlocked !')
        } else if(diff > 0){
          //console.log('not expired', diff)
          let exp = (diff/one_day).toFixed(2)
          let msg = exp.toString() + ' days'
          setRemainingTime(msg)
        } else {
          console.log('Error calculating unlock time...')
        }    
      }
    } catch(err){
      console.err(err)
    }    

  }

  const handleWithdraw = async () => {
    setUserMessage('')
    let today  = Date.now()
    let expiration = new Date(unlockTime)

    let diff = expiration - today
    if(diff < 0) {
      try{
        const batch = await Tezos.wallet.batch()
        .withContractCall(vaultContract.methods.withdrawAll())
        const op = await batch.send()
        await op.confirmation().then((conf) => {
          if(conf.completed === true){
            console.log('withdrawal confirmed :', conf)
            setUserMessage('Withdraw Success!');
            setVault(null)
          } else {
            setUserMessage('Withdraw Failed!');
          }
        })
      }catch(err){
        console.log(err)
      }

    } else if(diff > 0){
      try{
        const batch = await Tezos.wallet.batch()
        .withContractCall(vaultContract.methods.withdrawAllWithPenalty())
        const op = await batch.send()
        await op.confirmation().then(async (conf) => {
          if(conf.completed === true){
            setUserMessage('Withdrawal with penalty complete!');

          } else {
            setUserMessage('Withdrawal with penalty failed!');
          }
        })
      } catch(err){
        console.error(err)
      }
    }
    console.log(diff)
  }

  const calculateWithdraw = async () => {
    try{
      //console.log(vaultShares, managerTotalBalance, managerTotalShares)
      if((vaultShares !== null) && (managerTotalBalance!== null) &&( managerTotalShares !== null)){
        const claimables = (vaultShares *managerTotalBalance) / managerTotalShares
        const vaultForClaim = (claimables - vaultBalance) / 1000000
        //console.log('totalClaimables : ', claimables)
        if (vaultForClaim <= 0){
          setClaimable(0)
        }else {
          setClaimable(vaultForClaim)
        }
        
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


  useEffect(() => {
    const setTimers = async () => {
      try{
        if(pkh!==''){
          await readManagerStorage()
          await readVaultStorage()
          await calculateTime()
          await calculateWithdraw()
          await loadVaultData()
        } else {
          console.log('waiting for login')
        }
      }catch(err){
        console.log(err)
      }
    }
    const interval = setInterval(() => {
      console.log('updating...')
      setTimers()
    },5000)
    return () => clearInterval(interval)
  },[managerTotalBalance, vaultStorage])

  useEffect(() => {
    try {
      if(pkh !==''){
        readManagerStorage()

        readVaultStorage()
      }
    }catch(err){
      console.error(err)
    }
  })

  if (vault!==null){

    return (
      <section>
      <Topbar />
        <div className="section-content">
          <InfoTable 
            name={vault}
            info={vaultBalance}
            timer={remainingTime}
            balance={managerTotalBalance}
            totalClaimable={claimable}
            fromPenalties={penaltyFunds}
          />
          <Divider />
          <Box sx={{flexGrow:1}}>
          <Grid style={{padding:'10px'}} container alignItems='center' spacing={2}>
            <Grid item sm={6} lg={4} xs={8}>
            <div>
            <Card sx={{minWidth:250, minHeight:150}}>
            <CardContent>
              <Typography sx={{fontSize:14}} color="text.secondary" gutterBottom>
                Lock funds
              </Typography>
              <Divider />
              <Typography sx={{fontSize:14}} color="text.primary"  padding={1}>
                This will lock your funds to the vault
                Fantastic working applications
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
            </div>
          </Grid>
          <Grid item sm={6} lg={4} xs={8}>
            <div>
              <Card sx={{minWidth:250 , minHeight:150}}>
              <CardContent>
                <Typography sx={{fontSize:14}} color="text.secondary" gutterBottom>
                  Delegate
                </Typography>
                <Divider />
                <Typography sx={{fontSize:14}} color="text.primary" padding={1}>
                  Choose delegator address.
                  This will delegate to the delegator. Delegate
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
            
            </div>
          </Grid>
          <Grid item sm={6} lg={4} xs={8}>
            <div>
            <Card sx={{minWidth:250 , minHeight:150}}>
            <CardContent>
              <Typography sx={{fontSize:14}} color="text.secondary" gutterBottom>
                Claim Vault Resta
              </Typography>
              <Divider />
              <Typography sx={{fontSize:15}} color="text.primary"  padding={2.3}>
                Short description
                enter fancy words. fantastic internet money 
              </Typography>
                <CardActions>
                <Button
                  disabled={vault===''}
                  onClick={handleClaim}
                  className="distribute-button"
                  >
                  Claim
                </Button>
                </CardActions>
            </CardContent>
          </Card>            
            
            </div>
          </Grid>
          <Grid item sm={6} lg={4} xs={8}>
            <div>
            <Card sx={{minWidth:250 , minHeight:150}}>
            <CardContent>
              <Typography sx={{fontSize:14}} color="text.secondary" gutterBottom>
                Withdraw vault
              </Typography>
              <Divider />
              <Typography sx={{fontSize:16}} color="text.primary"  padding={1}>
                This will delete your vault and all your base are belong to us 
              </Typography>
                <CardActions>
                <Button
                  disabled={vault===''}
                  onClick={handleWithdraw}
                  className="distribute-button"
                  >
                  Withdraw All
                </Button>
                </CardActions>
            </CardContent>
            </Card>            
            </div>
          </Grid>
          </Grid>          
          </Box>
          <Divider/>
          {userMessage ? <MessageBar key={Math.random} incoming={userMessage} /> : null}
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
        <LandingCard/>
      </section>
    )


  }
};
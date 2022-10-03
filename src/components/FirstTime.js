import React, { useEffect, useState, useCallback } from "react";
import {Card, CardActions, CardContent, Typography, CardMedia} from "@mui/material"
import { Button } from "./Button";
import useBeacon, { contractAddress } from "../hooks/useBeacon";

export const FirstTime = () => {
    const { contract, storage, pkh, Tezos, wallet } = useBeacon();

    const refreshPage = async () => {
        window.location.reload(false)
    }

    const handleCreateVault = async () => {
        try {
          console.log(storage)
          const batch = await Tezos.wallet.batch()
          .withContractCall(contract.methods.createVault())

          const op = await batch.send()
          const confirm = await op.confirmation().then((conf) => {refreshPage()})

          console.log(await confirm)
        } catch(err){
          console.log(err)
        }
        
      }
    return (
        <section>
        
            <Card variant="outlined">
                <CardContent>
                    <CardMedia
                    component="img"
                    height="194"
                    image="/images/vaults.jpg"
                    alt="vaults image"
                    />
                    <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                        Create New Vault
                    </Typography>
                    <Typography variant="h5" component="div">
                        Click the button to create a new vault.
                    </Typography>
                    <CardActions>
                        <Button
                        onClick={handleCreateVault}
                        className="distribute-button"
                        >
                        Create Vault
                        </Button>
                    </CardActions>
                </CardContent>
            </Card>

      </section> 
    )
}
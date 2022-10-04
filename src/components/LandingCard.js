import React, { useState } from "react";
import {Box, Card, CardActions, CardContent, Grid,Typography, CardMedia} from "@mui/material"



export const LandingCard = () => {

    return (
        <Grid container spacing={0} direction='column' alignItems='center' justifyItems='center' style={{ minHeight: '80vh' }}>

            <Card sx={{maxWidth:420}}>
                <CardMedia
                    component='img'
                    height='400vh'
                    image='./images/vaultsIcon.jpg'
                    alt='logo'
                    style={{marginTop:'10vh'}}
                />
                <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                        tezVaults
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Welcome to the the amazing financial instruments of
                        supreme leaders. Please log in and gib mony
                    </Typography>
                </CardContent>
            </Card>

        </Grid>

    )

}
import React from "react";
import { AppBar, Box, Toolbar, IconButton, Typography, Paper, MenuIcon, Container, Avatar, MenuItem,AdbIcon, Icon } from "@mui/material";


export const Topbar = () => {

  return (
    <section>
        <Container component={Paper}>
            <Toolbar  variant="dense">
            <img style={{padding:'10px'}}src="./images/vaultsIcon.jpg" alt='vault' height='35' width='35'/>
                <Typography
                    variant='h6'
                    noWrap
                    component="a"
                    href="/"
                    sx={{
                        mr: 2,
                        display: { xs: '1', md: 'flex' },
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        letterSpacing: '.3rem',
                        color: 'inherit',
                        textDecoration: 'none',
                    }}
                >tezVaults
                </Typography>
                <Box>
                    <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    color="inherit"
                    >
                    
                    </IconButton>
                    
                </Box>
            </Toolbar>
        </Container>
    </section>
  );
};
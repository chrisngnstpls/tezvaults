import React from "react";
import { Table, TableBody, TableCell,TableContainer, TableHead,TableRow, Paper,Typography} from "@mui/material";

export const InfoTable = (props) => {
    //let linkOut = `https://ghostnet.tzkt.io/${props.name}/storage/`
    let linkOut = `https://kathmandunet.tzkt.io/${props.name}/storage/`


    return(
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                    <TableCell align='center' id='vault' colSpan={5}><Typography variant="h6" component='h5'> Vault : <a target='_blank' rel="noreferrer" href={linkOut}>{props.name}</a></Typography></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Vault Balance</TableCell>
                        <TableCell>Time to unlock</TableCell>
                        <TableCell>Manager Balance</TableCell>
                        <TableCell>Total Claimable</TableCell>
                        <TableCell>Penalty Claims</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>{props.info}</TableCell>
                        <TableCell>{props.timer}</TableCell>
                        <TableCell>{props.balance} ETH</TableCell>
                        <TableCell>{props.totalClaimable} ETH</TableCell>
                        <TableCell>{props.fromPenalties}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
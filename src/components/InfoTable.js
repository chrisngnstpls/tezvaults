import React from "react";
import { Table, TableBody, TableCell,TableContainer, TableHead,TableRow, Paper } from "@mui/material";

export const InfoTable = (props) => {
    return(
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} size="small" stickyHeader aria-label="sticky table">
                <TableHead>
                    <TableRow>
                    <TableCell align="center" colSpan={5}>Vault ID : {props.name}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Vault Info 1</TableCell>
                        <TableCell>Time to unlock</TableCell>
                        <TableCell>Balance</TableCell>
                        <TableCell>Total Claimable</TableCell>
                        <TableCell>Penalty Claims</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>{props.info}</TableCell>
                        <TableCell>{props.timer}</TableCell>
                        <TableCell>{props.balance}</TableCell>
                        <TableCell>{props.totalClaimable}</TableCell>
                        <TableCell>{props.fromPenalties}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    )
}
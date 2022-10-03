import React, { useState } from "react";
import { Snackbar } from "@mui/material";
import MuiAlert from '@mui/material/Alert';


export const MessageBar = () => {
    const [userMessage, setUserMessage] = useState(null)


    return (
        <div>
            {userMessage && <Snackbar open={userMessage} message={userMessage}/>}       
        </div>
        
    //     <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
    //     <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
    //       {props.message}
    //     </Alert>
    //   </Snackbar>
    )
}
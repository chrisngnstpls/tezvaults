import React, { useState } from "react";
import { Snackbar, IconButton, Icon, Alert } from "@mui/material";
import {Close} from "@mui/icons-material"
import MuiAlert from '@mui/material/Alert';


export default function MessageBar(props) {
    const [open, setOpen] = useState(true);
    console.log(props)
    //let _incoming = props.incoming.toString()
    const Alert = React.forwardRef(function Alert(props, ref) {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
      });

    function handleClose(event, reason) {
        if(reason==="clickaway") {
            return;
        }
        setOpen(false);
    }
    // return (
    //     <div>
    //       <Snackbar
    //         anchorOrigin={{
    //           vertical: "bottom",
    //           horizontal: "left"
    //         }}
    //         open={open}
    //         autoHideDuration={2000}
    //         onClose={handleClose}
    //         severity='success'
    //         ContentProps={{
    //           "aria-describedby": "message-id"
    //         }}
    //         message={props.message}
    //         action={[
    //           <IconButton key="close" onClick={handleClose}>
    //             <Close />
    //           </IconButton>
    //         ]}
    //       />
    //     </div>
    //   );
    // if(props.includes('success', 0)){
        return (
            <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} ContentProps={{"aria-describedby": "message-id"}} anchorOrigin={{vertical:'bottom', horizontal:'right'}}>
            <Alert onClose={handleClose} severity='success' sx={{width:'100%'}}>
                {props.incoming}
            </Alert>
            
            </Snackbar>
        )
    // } else if (props.includes('fail', 0)){
    //     return (
    //         <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} ContentProps={{"aria-describedby": "message-id"}}>
    //         <Alert onClose={handleClose} severity='error' sx={{width:'100%'}}>
    //             {props.incoming}
    //         </Alert>
            
    //         </Snackbar>
    //     )        
    // }

}
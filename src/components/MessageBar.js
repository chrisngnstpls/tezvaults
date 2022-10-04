import React, { useState } from "react";
import { Snackbar,} from "@mui/material";
import MuiAlert from '@mui/material/Alert';


export default function MessageBar(props) {
    const [open, setOpen] = useState(true);
    const Alert = React.forwardRef(function Alert(props, ref) {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
      });

    function handleClose(event, reason) {
        if(reason==="clickaway") {
            return;
        }
        setOpen(false);
    }

        return (
            <Snackbar open={open} autoHideDuration={2000} onClose={handleClose} ContentProps={{"aria-describedby": "message-id"}} anchorOrigin={{vertical:'bottom', horizontal:'right'}}>
            <Alert onClose={handleClose} severity='success' sx={{width:'100%'}}>
                {props.incoming}
            </Alert>
            
            </Snackbar>
        )

}
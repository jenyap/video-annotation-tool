import React from "react";
import SessionContext from '../contexts/session/sessionContext';

import { Paper, Typography, Container } from "@mui/material";
import { CheckCircle } from "@mui/icons-material"

function CompletedTask() {
    const { sessionId } = React.useContext(SessionContext);
    return (
        <Container maxWidth="sm" sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <Typography variant='h6'>
                    Task Completed. Thank You!!!
                </Typography>
                <CheckCircle color="success" fontSize="large" />
            </Paper>
        </Container>
    );
}

export default CompletedTask;

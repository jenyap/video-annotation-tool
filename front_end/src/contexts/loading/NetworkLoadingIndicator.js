import React from 'react';
import { CircularProgress } from '@mui/material';
import LoadingContext from './loadingContext';
import './NetworkLoadingIndicator.css';


function NetworkLoadingIndicator() {
    const context = React.useContext(LoadingContext);

    return (
        <>
            {context.networkLoadingCount > 0 && (
                <div className='NetworkLoadingIndicator'>
                    <CircularProgress />
                </div>
            )}
        </>
    )

}

export default NetworkLoadingIndicator;
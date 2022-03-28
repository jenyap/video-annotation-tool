import React from 'react';
import { CircularProgress } from '@mui/material';
import LoadingContext from './loadingContext';
import './InternalLoadingIndicator.css';


function InternalLoadingIndicator() {
    const context = React.useContext(LoadingContext);

    return (
        <>
            {context.internalLoadingCount > 0 && (
                <div className='InternalLoadingIndicator'>
                    <CircularProgress />
                </div>
            )}
        </>
    )

}

export default InternalLoadingIndicator;
import React, { useState } from 'react';

import LoadingContext from './loadingContext';
import NetworkLoadingIndicator from './NetworkLoadingIndicator';

function LoadingProvider(props) {
    const { children } = props;

    const showNetworkLoading = () => {
        toggleLoading(prevState => {
            return {
                ...prevState,
                networkLoadingCount: prevState.networkLoadingCount + 1
            }
        })
    };

    const hideNetworkLoading = () => {
        toggleLoading(prevState => {
            return {
                ...prevState,
                networkLoadingCount:
                    prevState.networkLoadingCount > 0 ? prevState.networkLoadingCount - 1 : 0
            }
        })
    };

    const showInternalLoading = () => {
        toggleLoading(prevState => {
            return {
                ...prevState,
                internalLoadingCount: prevState.internalLoadingCount + 1
            }
        })
    };

    const hideInternalLoading = () => {
        toggleLoading(prevState => {
            return {
                ...prevState,
                internalLoadingCount:
                    prevState.internalLoadingCount > 0 ? prevState.internalLoadingCount - 1 : 0
            }
        })
    };


    const loadingState = {
        networkLoadingCount: 0,
        showNetworkLoading,
        hideNetworkLoading,
        internalLoadingCount: 0,
        showInternalLoading,
        hideInternalLoading,
    };

    const [loading, toggleLoading] = useState(loadingState);

    return (
        <>
            <LoadingContext.Provider value={loading}>
                {children}
                <NetworkLoadingIndicator />
                {/* <InternalLoadingIndicator /> */}
            </LoadingContext.Provider>
        </>
    );
}

export default LoadingProvider
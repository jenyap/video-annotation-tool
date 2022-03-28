import React from 'react';

const LoadingContext = React.createContext({
    showNetworkLoading: () => { },
    hideNetworkLoading: () => { },
    networkLoadingCount: 0,
    showInternalLoading: () => { },
    hideInternalLoading: () => { },
    internalLoadingCount: 0,
});

export default LoadingContext;

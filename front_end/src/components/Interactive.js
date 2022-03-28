import React, { useEffect } from 'react';

import './Interactive.css';

import EditedVideoDisplayer from './EditedVideoDisplayer';
import VideoFrameEditor from './VideoFrameEditor/VideoFrameEditor';
import videoClient from '../videoClient';
import LoadingContext from '../contexts/loading/loadingContext';
import InternalLoadingIndicator from '../contexts/loading/InternalLoadingIndicator';
import LockShortcutProvider from '../customHooks/LockShortcutProvider';
import TaskContext from '../contexts/task/taskContext';


function Interactive() {
    const { showNetworkLoading } = React.useContext(LoadingContext);
    const { dataAnnotation, videoName } = React.useContext(TaskContext);
    const [readyToFetchState, setReadyToFetchState] = React.useState(false);
    const [shouldFetch, setShouldFetch] = React.useState(false);
    const [hasNewRequestPending, setHasNewRequestPending] = React.useState(false);

    const handleReadyToFetchChanged = React.useCallback((newState) => {
        setReadyToFetchState(newState);
    }, [])

    useEffect(() => {
        if (!dataAnnotation || !dataAnnotation.length) {
            return;
        }
        setHasNewRequestPending(true);
    }, [dataAnnotation])

    useEffect(() => {
        if (!readyToFetchState) {
            setShouldFetch(false);
            return;
        }

        if (hasNewRequestPending) {
            setShouldFetch(true);
            setHasNewRequestPending(false);
        }
    }, [readyToFetchState, hasNewRequestPending])

    useEffect(() => {
        videoClient.cancelEditRequests();
        showNetworkLoading();
    }, [videoName, showNetworkLoading]);

    return (
        <div className='Interactive'>
            <EditedVideoDisplayer
                onReadyToFetchStatusChanged={handleReadyToFetchChanged}
                shouldFetch={shouldFetch}
            />
            <div className='video-frame-editor-wrapper'>
                <LockShortcutProvider>
                    <VideoFrameEditor className='video-frame-editor-interactive' />
                </LockShortcutProvider>
                <InternalLoadingIndicator />
            </div>
        </div>
    );
}

export default Interactive;

import React, { useCallback, useEffect } from 'react';

import VideoDisplayer from "./VideoDisplayer";
import videoClient from '../videoClient';
import LoadingContext from '../contexts/loading/loadingContext';
import { Typography, LinearProgress } from '@mui/material';
import "./EditedVideoDisplayer.css";
import consts from '../consts';
import TaskContext from '../contexts/task/taskContext';
import SessionContext from '../contexts/session/sessionContext';

const VIDEOS_DIMENSIONS = {
    editorWidth: 480,
    editorHeight: 270
}

function EditedVideoDisplayer(props) {
    const { onReadyToFetchStatusChanged, shouldFetch } = props;
    const { hideNetworkLoading, networkLoadingCount } = React.useContext(LoadingContext);
    const { dataAnnotation, distortion, videoName } = React.useContext(TaskContext);
    const { sessionId } = React.useContext(SessionContext);
    const [videoSrc, setVideoSrc] = React.useState();
    const [isProcessing, setIsProcessing] = React.useState(false);
    const isUnmountedRef = React.useRef(false)

    React.useEffect(() => {
        return () => { isUnmountedRef.current = true; }
    }, []);

    const editVideo = useCallback(async () => {
        if (!dataAnnotation || !distortion || !videoName) {
            return;
        }
        setIsProcessing(true);
        const newVideoSrc = await videoClient.editVideo(videoName, distortion, sessionId, dataAnnotation, VIDEOS_DIMENSIONS)
        if (newVideoSrc && !isUnmountedRef.current) {
            setVideoSrc(newVideoSrc);
            setIsProcessing(false);
            hideNetworkLoading();
        }
    }, [dataAnnotation, distortion, videoName, sessionId, hideNetworkLoading]);


    useEffect(() => {
        async function sendEditVideo() {
            onReadyToFetchStatusChanged(false);
            await editVideo()
            if (!isUnmountedRef.current) {
                onReadyToFetchStatusChanged(true)
            }
        }

        if (!shouldFetch) {
            return;
        }

        sendEditVideo();
    }, [shouldFetch, onReadyToFetchStatusChanged, editVideo])

    useEffect(() => {
        onReadyToFetchStatusChanged(true);
    }, [onReadyToFetchStatusChanged])

    return (
        <div className='EditedVideoDisplayer'>
            <Typography variant='h5' align='center'>
                Distorted Video ({consts.DistortionCodeToDisplayMapping[distortion]})
            </Typography>
            <VideoDisplayer src={videoSrc} />
            {isProcessing && networkLoadingCount === 0 && (
                <div>
                    <Typography variant='body2'>Processing Video...</Typography>
                    <LinearProgress />
                </div>
            )}
        </div>
    )
}

export default EditedVideoDisplayer;

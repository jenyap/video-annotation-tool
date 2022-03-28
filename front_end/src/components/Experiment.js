import React from 'react';

import videoClient from '../videoClient';
import './Experiment.css';

import { Button } from "@mui/material";
import LoadingContext from '../contexts/loading/loadingContext';
import SessionContext from '../contexts/session/sessionContext';
import TaskContext from '../contexts/task/taskContext';
import consts from '../consts';
import { useNavigate } from 'react-router-dom'


function Experiment(props) {
    const { children } = props;
    const { showNetworkLoading, hideNetworkLoading, internalLoadingCount } = React.useContext(LoadingContext);
    const { sessionId } = React.useContext(SessionContext);
    const {
        videoName,
        setVideoName,
        setFrameCount,
        distortion,
        permutation,
        setPermutation,
        setDistortion,
        videoNum,
        increaseVideoNum,
        dataAnnotation,
        areAllTasksCompleted,
        completeAllTasks,
        isTaskInitialized,
        initTask,
        delayPassed,
        setDelayPassed,
        resetTaskData
    } = React.useContext(TaskContext);
    const [readyToFetch, setReadyToFetch] = React.useState(true);
    const [nextButtonProcessing, setNextButtonProcessing] = React.useState(false);
    const navigate = useNavigate();

    const getNextTask = React.useCallback(async () => {
        setNextButtonProcessing(false);
        showNetworkLoading();
        const videoMetadata = await videoClient.getNextTask(videoName, permutation, videoNum);
        if (videoMetadata.permutation === -1) {
            hideNetworkLoading();
            completeAllTasks();
            return;
        }
        setVideoName(videoMetadata.name);
        setPermutation(videoMetadata.permutation);
        setDistortion(videoMetadata.distortion)
        setFrameCount(videoMetadata.frames);
        increaseVideoNum();
        initTask(true);
        hideNetworkLoading();
        setDelayPassed(false);
        setTimeout(() => {
            setDelayPassed(true);
        }, consts.SPEND_MINUTES * 1000 * 60);
    }, [videoName, permutation, videoNum, initTask, setVideoName, setPermutation, setDistortion, setFrameCount,
        increaseVideoNum, completeAllTasks, showNetworkLoading, hideNetworkLoading, setDelayPassed]);

    React.useEffect(() => {
        async function fetchNextVideo() {
            await getNextTask();
        }

        if (!readyToFetch || isTaskInitialized) {
            return;
        }

        setReadyToFetch(false);
        fetchNextVideo();
    }, [readyToFetch, getNextTask, isTaskInitialized])

    React.useEffect(() => {
        if (areAllTasksCompleted) {
            navigate('/completed_task');
            return;
        }
    }, [areAllTasksCompleted, navigate])

    const handleNextClicked = React.useCallback(async () => {
        setNextButtonProcessing(true);
        await videoClient.saveExperimentResult(videoName, dataAnnotation, distortion, sessionId);
        resetTaskData();
        setReadyToFetch(true);
    }, [dataAnnotation, sessionId, videoName, distortion, resetTaskData]);

    return (
        isTaskInitialized && !areAllTasksCompleted &&
        <div className='Experiment'>
            {children}
            <div className='experiment-footer'>
                <Button onClick={async () => await handleNextClicked()} variant="contained" disabled={nextButtonProcessing || internalLoadingCount > 0 || !delayPassed}>Next Video</Button>
            </div>
        </div>
    );

}

export default Experiment;

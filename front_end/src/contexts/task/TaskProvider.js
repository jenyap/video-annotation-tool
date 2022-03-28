import React from 'react';

import TaskContext from './taskContext';

function TaskProvider(props) {
    const { children } = props;

    const setDataAnnotation = (newDataAnnotation) => {
        setTaskState(prevState => ({ ...prevState, dataAnnotation: newDataAnnotation }));
    };

    const setAbsDataAnnotation = (newAbsDataAnnotation) => {
        setTaskState(prevState => ({ ...prevState, absDataAnnotation: newAbsDataAnnotation }));
    };

    const setVideoName = (newVideoName) => {
        setTaskState(prevState => ({ ...prevState, videoName: newVideoName }));
    };

    const setFrameCount = (newFrameCount) => {
        setTaskState(prevState => ({ ...prevState, frameCount: newFrameCount }));
    };

    const setDistortion = (newDistortion) => {
        setTaskState(prevState => ({ ...prevState, distortion: newDistortion }));
    };

    const setPermutation = (newPermutation) => {
        setTaskState(prevState => ({ ...prevState, permutation: newPermutation }));
    };

    const increaseVideoNum = () => {
        setTaskState(prevState => ({ ...prevState, videoNum: prevState.videoNum + 1 }));
    };

    const setPixelFlow = (newPixelFlow) => {
        setTaskState(prevState => ({ ...prevState, pixelFlow: newPixelFlow }));
    };

    const setFrameSrcs = (newFrameSrcs) => {
        setTaskState(prevState => ({ ...prevState, frameSrcs: newFrameSrcs }));
    };

    const setVideoSrc = (newVideoSrc) => {
        setTaskState(prevState => ({ ...prevState, videoSrc: newVideoSrc }));
    };

    const completeAllTasks = () => {
        setTaskState(prevState => ({ ...prevState, areAllTasksCompleted: true }));
    };

    const initTask = () => {
        setTaskState(prevState => ({ ...prevState, isTaskInitialized: true }));
    };

    const setDelayPassed = (newDelayPassed) => {
        setTaskState(prevState => ({ ...prevState, delayPassed: newDelayPassed }));
    };

    const resetTaskData = () => {
        setTaskState(prevState => ({
            ...prevState,
            dataAnnotation: null,
            absDataAnnotation: null,
            frameCount: null,
            distortion: null,
            pixelFlow: null,
            frameSrcs: null,
            videoSrc: null,
            isTaskInitialized: false,
            delayPassed: false
        }));
    };

    const task = {
        dataAnnotation: null,
        setDataAnnotation,
        absDataAnnotation: null,
        setAbsDataAnnotation,
        videoName: 0,
        setVideoName,
        frameCount: null,
        setFrameCount,
        distortion: null,
        setDistortion,
        permutation: -1,
        setPermutation,
        videoNum: 0,
        increaseVideoNum,
        pixelFlow: null,
        setPixelFlow,
        frameSrcs: null,
        setFrameSrcs,
        videoSrc: null,
        setVideoSrc,
        areAllTasksCompleted: false,
        completeAllTasks,
        isTaskInitialized: false,
        initTask,
        delayPassed: false,
        setDelayPassed,
        resetTaskData
    }

    const [taskState, setTaskState] = React.useState(task);

    return (
        <TaskContext.Provider value={taskState}>
            {children}
        </TaskContext.Provider>
    );
}

export default TaskProvider;
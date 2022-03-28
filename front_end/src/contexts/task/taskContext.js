import React from 'react';

const TaskContext = React.createContext({
    dataAnnotation: null,
    setDataAnnotation: (newDataAnnotation) => { },
    absDataAnnotation: null,
    setAbsDataAnnotation: (newAbsDataAnnotation) => { },
    videoName: 0,
    setVideoName: (newVideoName) => { },
    frameCount: null,
    setFrameCount: (newFrameCount) => { },
    distortion: null,
    setDistortion: (newDistortion) => { },
    permutation: -1,
    setPermutation: (newPermutation) => { },
    videoNum: 0,
    increaseVideoNum: () => { },
    pixelFlow: null,
    setPixelFlow: (newPixelFlow) => { },
    frameSrcs: null,
    setFrameSrcs: (newFrameSrcs) => { },
    videoSrc: null,
    setVideoSrc: (newVideoSrc) => { },
    areAllTasksCompleted: false,
    completeAllTasks: () => { },
    isTaskInitialized: false,
    initTask: () => { },
    delayPassed: false,
    setDelayPassed: () => { },
    resetTaskData: () => { }
});

export default TaskContext;
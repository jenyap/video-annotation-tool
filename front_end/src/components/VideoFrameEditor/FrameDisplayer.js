import React from "react";
import TaskContext from "../../contexts/task/taskContext";
import './FrameDisplayer.css'

function FrameDisplayer(props) {
    const { frameIndex } = props;
    const { frameSrcs } = React.useContext(TaskContext);

    return (
        <>
            {frameSrcs && frameIndex != null &&
                <img src={frameSrcs[frameIndex]} width="480" height="270" className="video-frame" alt="" />
            }
        </>
    );
}

export default FrameDisplayer;
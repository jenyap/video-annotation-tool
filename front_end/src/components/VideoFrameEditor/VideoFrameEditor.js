import React from "react";
import { Slider, Typography } from "@mui/material";
import './VideoFrameEditor.css';
import FrameDisplayer from "./FrameDisplayer";
import AnnotationEditor from "./AnnotationEditor";
import Brush from "./Brush";
import DrawingMode from "./DrawingMode";
import consts from "../../consts";
import useKey from "../../customHooks/useKey";
import LockShortcutContext from "../../customHooks/lockShortcutContext";
import videoClient from '../../videoClient';
import TaskContext from "../../contexts/task/taskContext";

function VideoFrameEditor() {
    const [frameIndex, setFrameIndex] = React.useState();
    const [brushRadius, setBrushRadius] = React.useState(consts.DEFAULT_BRUSH_RADIUS);
    const [drawingMode, setDrawingMode] = React.useState(consts.DrawingMode.DRAW);
    const [maxFrame, setMaxFrame] = React.useState();
    const { isLocked } = React.useContext(LockShortcutContext);
    const { videoName, frameCount, pixelFlow, frameSrcs, setFrameSrcs, setPixelFlow } = React.useContext(TaskContext);

    const getSingleVideo = React.useCallback(async () => {
        if (!!pixelFlow || !!frameSrcs) {
            return;
        }

        const [newPixelFlow, ...newFrameSrcs] = await Promise.all(
            [
                videoClient.getPixelFlow(videoName),
                ...[...Array(frameCount).keys()].map(i => videoClient.getFrameSrcs(videoName, i))
            ]
        )

        setPixelFlow(newPixelFlow);
        setFrameSrcs(newFrameSrcs);
    }, [videoName, frameCount, pixelFlow, frameSrcs, setPixelFlow, setFrameSrcs]);

    React.useEffect(() => {
        async function fetchVideo() {
            await getSingleVideo();
        }

        setFrameIndex(0);
        setMaxFrame(frameCount - 1);
        fetchVideo();
    }, [frameCount, getSingleVideo]);

    const handleIncreaseFrameIndex = React.useCallback(() => {
        setFrameIndex(Math.min(frameIndex + 1, maxFrame));
    }, [frameIndex, maxFrame]);

    const handleDecreaseFrameIndex = React.useCallback(() => {
        setFrameIndex(Math.max(frameIndex - 1, 0));
    }, [frameIndex]);

    useKey("s", handleIncreaseFrameIndex, isLocked);
    useKey("a", handleDecreaseFrameIndex, isLocked);

    return (
        <div className="VideoFrameEditor">
            <div className="drawing-mode" >
                <DrawingMode drawingMode={drawingMode} onDrawingModeChange={(val) => setDrawingMode(val)} />
            </div>
            <div className="video-frame-editor-video-zone">
                <Typography variant="h5" align="center">
                    Annotation Map
                </Typography>
                <div className="video-canvas-inside-wrapper">
                    <FrameDisplayer frameIndex={frameIndex} />
                    <AnnotationEditor
                        frameIndex={frameIndex}
                        brushRadius={brushRadius}
                        drawingMode={drawingMode}
                    />
                </div>
                {frameIndex != null &&
                    <Slider
                        value={frameIndex}
                        onChange={(e, newValue) => setFrameIndex(newValue)}
                        min={0}
                        max={maxFrame}
                        size="small"
                        valueLabelDisplay="auto"
                    />
                }
                <Brush onBrushRadiusChange={(val) => setBrushRadius(val)} drawingMode={drawingMode} />
            </div>
        </div>
    );
}

export default VideoFrameEditor;
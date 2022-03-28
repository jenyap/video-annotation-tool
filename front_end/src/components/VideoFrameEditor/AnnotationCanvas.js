import React from "react";
import drawingUtils from "./drawingUtils";
import './AnnotationCanvas.css';
import annotationDataUtils from "./annotationDataUtils";
import LockShortcutContext from "../../customHooks/lockShortcutContext";

function AnnotationCanvas(props) {
    const { annotationData, absAnnotationData, frameIndex, brushRadius, drawingMode, notifyUserFinishDraw } = props;
    const canvasRef = React.useRef();
    const updatedDataRef = React.useRef();
    const { setIsLocked } = React.useContext(LockShortcutContext);

    React.useEffect(() => {
        if (frameIndex == null) {
            return;
        }

        updatedDataRef.current = annotationDataUtils.getEmptyDataAnnotation(1, 0)
        const drawTimeout = setTimeout(() => {
            drawingUtils.drawAnotationCanvas(canvasRef.current, annotationData, frameIndex, null, null, drawingMode);
        }, 0);
        return () => { clearTimeout(drawTimeout); }
    }, [frameIndex, annotationData, drawingMode]);


    const handleUserFinishDraw = React.useCallback((e) => {
        setIsLocked(false);
        notifyUserFinishDraw({ updatedData: updatedDataRef.current });
        updatedDataRef.current = annotationDataUtils.getEmptyDataAnnotation(1, 0);
    }, [notifyUserFinishDraw, setIsLocked]);

    const handleMouseDown = (e) => {
        setIsLocked(true);
    }

    const handleMouseMove = (e) => {
        if (isUserDrawing(e)) {
            annotationDataUtils.updateAnnotationDataForCurrentFrame(
                annotationData, absAnnotationData, e, frameIndex, brushRadius, canvasRef.current, updatedDataRef.current, drawingMode);
        }
        drawingUtils.drawAnotationCanvas(canvasRef.current, annotationData, frameIndex, e, brushRadius, drawingMode);
    };

    const handleMouseLeave = (e) => {
        drawingUtils.drawAnotationCanvas(canvasRef.current, annotationData, frameIndex, null, null, drawingMode);
        if (isUserDrawing(e)) {
            handleUserFinishDraw(e);
        }
    };

    const handleMouseUp = (e) => {
        drawingUtils.drawAnotationCanvas(canvasRef.current, annotationData, frameIndex, null, null, drawingMode);
        handleUserFinishDraw(e);
    };

    const isUserDrawing = (e) => {
        return e.buttons > 0
    }

    return (
        <canvas
            width="480"
            height="270"
            className="annotation-canvas"
            ref={canvasRef}
            onMouseMove={e => handleMouseMove(e)}
            onMouseLeave={e => handleMouseLeave(e)}
            onMouseUp={e => handleMouseUp(e)}
            onMouseDown={e => handleMouseDown(e)}
        />
    );
}

export default AnnotationCanvas;

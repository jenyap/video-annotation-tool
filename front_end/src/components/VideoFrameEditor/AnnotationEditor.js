import React from "react";
import AnnotationCanvas from "./AnnotationCanvas";
import LoadingContext from "../../contexts/loading/loadingContext";
import annotationDataUtils from "./annotationDataUtils";
import asyncUtils from "../../asyncUtils";
import TaskContext from "../../contexts/task/taskContext";

function AnnotationEditor(props) {
    const { frameIndex, brushRadius, drawingMode } = props;
    const { showInternalLoading, hideInternalLoading } = React.useContext(LoadingContext);
    const { frameCount, pixelFlow, dataAnnotation, absDataAnnotation, setDataAnnotation, setAbsDataAnnotation } = React.useContext(TaskContext);
    const annotationDataRef = React.useRef();
    const absAnnotationDataRef = React.useRef();

    React.useEffect(() => {
        if (!!dataAnnotation && dataAnnotation.length) {
            annotationDataRef.current = dataAnnotation;
        } else {
            setDataAnnotation(annotationDataUtils.getEmptyDataAnnotation(frameCount));
        }
    }, [frameCount, dataAnnotation, setDataAnnotation]);

    React.useEffect(() => {
        if (!!absDataAnnotation && absDataAnnotation.length) {
            absAnnotationDataRef.current = absDataAnnotation;
        } else {
            setAbsDataAnnotation(annotationDataUtils.getEmptyDataAnnotation(frameCount));
        }
    }, [frameCount, absDataAnnotation, setAbsDataAnnotation]);

    const handleUseFinishDraw = React.useCallback(async ({ updatedData }) => {
        showInternalLoading();
        await asyncUtils.runAsync(annotationDataUtils.fillOtherFrames, frameIndex, annotationDataRef.current, absAnnotationDataRef.current, frameCount, drawingMode, updatedData, pixelFlow);
        await annotationDataUtils.normaizeDataAnnotation(annotationDataRef.current, absAnnotationDataRef.current);
        setDataAnnotation(annotationDataUtils.cloneDataAnnotation(annotationDataRef.current));
        hideInternalLoading();
    }, [frameIndex, frameCount, drawingMode, pixelFlow, setDataAnnotation, showInternalLoading, hideInternalLoading]);

    return (
        !!annotationDataRef.current &&
        <>
            <AnnotationCanvas
                annotationData={annotationDataRef.current}
                absAnnotationData={absAnnotationDataRef.current}
                frameIndex={frameIndex}
                brushRadius={brushRadius}
                drawingMode={drawingMode}
                notifyUserFinishDraw={async (args) => await handleUseFinishDraw(args)}
            />
        </>
    );
}

export default AnnotationEditor;

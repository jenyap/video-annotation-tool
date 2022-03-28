import consts from '../../consts';
import cursorUtils from './cursorUtils';
import asyncUtils from '../../asyncUtils';

function cloneDataAnnotation(dataAnnotation) {
    const clonnedDataAnnotation = new Uint8ClampedArray(dataAnnotation.length);
    for (let i = 0; i < clonnedDataAnnotation.length; i++) {
        clonnedDataAnnotation[i] = dataAnnotation[i];
    }
    return clonnedDataAnnotation;
}

function getEmptyDataAnnotation(numberOfFrames, defaultValue = Math.floor(consts.MAX_ALPHA / 2)) {
    const dataAnnotation = new Uint8ClampedArray(consts.VideoDimensions.WIDTH * consts.VideoDimensions.HEIGHT * numberOfFrames);
    for (let i = 0; i < dataAnnotation.length; i++) {
        dataAnnotation[i] = defaultValue;
    }
    return dataAnnotation;
}

async function normaizeDataAnnotation(dataAnnotation, absDataAnnotation) {
    const ratio = await asyncUtils.runAsync(getNormalizationRatio, absDataAnnotation);
    await asyncUtils.runAsync(performNormalization, dataAnnotation, absDataAnnotation, ratio);
}

function getNormalizationRatio(absDataAnnotation) {
    const dataAnnotationLen = absDataAnnotation.length;
    let sum = 0
    for (let i = 0; i < dataAnnotationLen; i++) {
        sum = sum + (absDataAnnotation[i] / consts.MAX_ALPHA);
    }
    const currAvgPixelValue = sum / dataAnnotationLen;
    return consts.AVG_PIXEL_VALUE / currAvgPixelValue;
}

function performNormalization(dataAnnotation, absDataAnnotation, ratio) {
    const dataAnnotationLen = dataAnnotation.length;
    for (let i = 0; i < dataAnnotationLen; i++) {
        dataAnnotation[i] = Math.min(Math.max(consts.MIN_ALPHA, parseInt(absDataAnnotation[i] * ratio)), consts.MAX_ALPHA);
    }
}

function updateAnnotationDataForCurrentFrame(annotationData, absAnnotationData, mouseEvent, frameIndex, brushRadius, canvasElement, updatedData, drawingMode) {
    const mousePos = cursorUtils.getMousePosOverCanvas(canvasElement, mouseEvent);
    const centerX = mousePos.x;
    const centerY = mousePos.y;

    const minX = Math.max(centerX - brushRadius, 0);
    const maxX = Math.min(centerX + brushRadius, consts.VideoDimensions.WIDTH - 1);
    const minY = Math.max(centerY - brushRadius, 0);
    const maxY = Math.min(centerY + brushRadius, consts.VideoDimensions.HEIGHT - 1)
    const squaredBrushRadius = brushRadius * brushRadius;
    const sign = drawingMode === consts.DrawingMode.ERASE ? -1 : 1;
    const startFrameIndex = consts.VideoDimensions.WIDTH * consts.VideoDimensions.HEIGHT * frameIndex

    for (let x = minX; x <= maxX; x++) {
        const xSquaredDist = (x - centerX) * (x - centerX);
        for (let y = minY; y <= maxY; y++) {
            const ySquaredDist = (y - centerY) * (y - centerY);
            const pointIndex = y * consts.VideoDimensions.WIDTH + x
            const d = annotationData[startFrameIndex + pointIndex];
            const abs_d = absAnnotationData[startFrameIndex + pointIndex];
            const offset = consts.BRUSH_THRESHOLD * Math.min(1, Math.max(0, 1 - (xSquaredDist + ySquaredDist) / squaredBrushRadius));
            annotationData[startFrameIndex + pointIndex] = Math.max(Math.min(d + sign * offset, consts.MAX_ALPHA), consts.MIN_ALPHA);
            absAnnotationData[startFrameIndex + pointIndex] = Math.max(Math.min(abs_d + sign * offset, consts.MAX_ALPHA), consts.MIN_ALPHA);
            updatedData[pointIndex] += Math.max(0, 1 - (xSquaredDist + ySquaredDist) / squaredBrushRadius);
        }
    }
}

async function fillOtherFrames(frameIndex, annotationData, absAnnontationData, numberOfFrames, drawingMode, updatedData, pixelFlow) {
    // dimensions
    // (total_frames, height, width, 2)
    const minFrame = Math.max(frameIndex, 0);
    // const minFrame = Math.max(frameIndex - consts.TIMELINE_WINDOW, 0);
    const maxFrame = Math.min(frameIndex + consts.TIMELINE_WINDOW, numberOfFrames - 1);
    const sign = drawingMode === consts.DrawingMode.ERASE ? -1 : 1;
    for (let t = minFrame; t <= maxFrame; t++) {
        if (t === frameIndex) { continue; }
        const startFrameIndex = consts.VideoDimensions.WIDTH * consts.VideoDimensions.HEIGHT * t;
        const startFlowFrameIndex = (t - 1) * consts.VideoDimensions.WIDTH * consts.VideoDimensions.HEIGHT * 2;
        const newUpdatedData = getEmptyDataAnnotation(1, 0);
        for (let x = 0; x < consts.VideoDimensions.WIDTH; x++) {
            for (let y = 0; y < consts.VideoDimensions.HEIGHT; y++) {
                // time dacay
                const timeDecay = (consts.TIMELINE_WINDOW - Math.abs(t - frameIndex)) / consts.TIMELINE_WINDOW;
                // annotationData before updating
                const pointIndex = y * consts.VideoDimensions.WIDTH + x;
                const d = annotationData[startFrameIndex + pointIndex];
                const abs_d = absAnnontationData[startFrameIndex + pointIndex]
                // Check from which pixel the value was propogated.
                const pointFlowIndex = y * consts.VideoDimensions.WIDTH * 2 + x * 2;
                const flow_x = pixelFlow[startFlowFrameIndex + pointFlowIndex];
                const flow_y = pixelFlow[startFlowFrameIndex + pointFlowIndex + 1];
                const prev_x = Math.min(Math.max(x - flow_x, 0), consts.VideoDimensions.WIDTH - 1);
                const prev_y = Math.min(Math.max(y - flow_y, 0), consts.VideoDimensions.HEIGHT - 1);
                // prev point index
                const dataPointIndex = prev_y * consts.VideoDimensions.WIDTH + prev_x;
                // Update value
                annotationData[startFrameIndex + pointIndex] =
                    Math.max(Math.min(d + sign * consts.BRUSH_THRESHOLD * updatedData[dataPointIndex] * timeDecay, consts.MAX_ALPHA), consts.MIN_ALPHA);
                absAnnontationData[startFrameIndex + pointIndex] =
                    Math.max(Math.min(abs_d + sign * consts.BRUSH_THRESHOLD * updatedData[dataPointIndex] * timeDecay, consts.MAX_ALPHA), consts.MIN_ALPHA);
                // Upade the paint based on the flow
                newUpdatedData[pointIndex] = updatedData[dataPointIndex]
            }
        }
        updatedData = newUpdatedData;

    }
}


export default {
    updateAnnotationDataForCurrentFrame,
    fillOtherFrames,
    normaizeDataAnnotation,
    cloneDataAnnotation,
    getEmptyDataAnnotation
}

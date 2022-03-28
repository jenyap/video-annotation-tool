import consts from '../../consts';
import cursorUtils from './cursorUtils';


function clearCanvas(canvasElement) {
    const ctx = canvasElement.getContext('2d');
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
}

function drawAnotationCanvas(canvasElement, annotationData, frameIndex, mouseEvent, brushRadius, drawingMode) {
    const ctx = canvasElement.getContext("2d");
    const imageData = ctx.createImageData(consts.VideoDimensions.WIDTH, consts.VideoDimensions.HEIGHT);
    const startIndex = consts.VideoDimensions.WIDTH * consts.VideoDimensions.HEIGHT * frameIndex;
    // Iterate through every pixel
    for (let i = 0; i < imageData.data.length; i += 4) {
        // Modify pixel data
        imageData.data[i + 0] = 255; // R value
        imageData.data[i + 1] = 0; // G value
        imageData.data[i + 2] = 0; // B value
        imageData.data[i + 3] = annotationData[startIndex + i / 4]; // A value
    }

    // Draw image data to the canvas
    ctx.putImageData(imageData, 0, 0);
    drawCursorBrush(canvasElement, ctx, mouseEvent, brushRadius, drawingMode);
}

function drawCursorBrush(canvasElement, ctx, mouseEvent, brushRadius, drawingMode) {
    if (!mouseEvent) {
        return;
    }

    const mousePos = cursorUtils.getMousePosOverCanvas(canvasElement, mouseEvent);
    ctx.beginPath();
    ctx.fillStyle = drawingMode === consts.DrawingMode.ERASE ? "#ffffffaa" : "#ff0000aa";
    ctx.arc(mousePos.x, mousePos.y, brushRadius, 0, Math.PI * 2, true);
    ctx.fill();
}


export default {
    clearCanvas,
    drawAnotationCanvas,
};

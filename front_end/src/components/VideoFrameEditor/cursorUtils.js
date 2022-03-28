import consts from '../../consts';

function getMousePosOverCanvas(canvasElement, mouseEvent) {
    var rect = canvasElement.getBoundingClientRect();
    return {
        x: mouseEvent.clientX - Math.round(rect.left),
        y: mouseEvent.clientY - Math.round(rect.top)
    };
}

export default {
    getMousePosOverCanvas,
}
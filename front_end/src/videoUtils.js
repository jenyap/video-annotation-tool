import consts from "./consts";

const ALGORITHMS_FUNC_MAP = {
    [consts.DrawingAlgorithm.CANNY]: drawCanny
};


/* global cv */

function getVideoCapture(videoElement) {
    return new cv.VideoCapture(videoElement);
}

async function getManipulatedVideoFrames(video, videoCapture, algorithm, numberOfFrames) {
    const manipulatedFrames = []
    let i = 0
    await new Promise((resolve) => {
        const intvl = setInterval(() => {
            if (i === numberOfFrames) {
                clearInterval(intvl);
                resolve();
            }
            video.currentTime = (i * video.duration) / numberOfFrames;
            const frame = new cv.Mat(consts.VideoDimensions.HEIGHT, consts.VideoDimensions.WIDTH, cv.CV_8UC4);
            videoCapture.read(frame);
            ALGORITHMS_FUNC_MAP[algorithm](frame);
            manipulatedFrames.push(frame);
            i++;
        }, 0);
    });

    return manipulatedFrames
}


function drawVideo(manipulatedFrameSrc, canvasElement) {
    cv.imshow(canvasElement, manipulatedFrameSrc);
}

function drawCanny(src) {
    cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
    cv.Canny(src, src, 50, 100, 3, false);
}

export default {
    getVideoCapture,
    getManipulatedVideoFrames,
    drawVideo
};
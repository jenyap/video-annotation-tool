const AVG_PIXEL_VALUE = 0.5

const BRUSH_THRESHOLD = 10;

const DEFAULT_BRUSH_RADIUS = 30;

const DrawingAlgorithm = {
    CANNY: 'CANNY'
}

const DrawingMode = {
    DRAW: 'DRAW',
    ERASE: 'ERASE'
}

const MAX_ALPHA = 255;

const MIN_ALPHA = 1;

const TIMELINE_WINDOW = 40;

const VideoDimensions = {
    WIDTH: 480,
    HEIGHT: 270
};

const DistortionCode = {
    BLUR: 'blur',
    SALT_AND_PEPPER_NOISE: 'salt_and_pepper_noise',
    X264: 'x264'
}

const DistortionCodeToDisplayMapping = {
    [DistortionCode.BLUR]: 'Blur',
    [DistortionCode.SALT_AND_PEPPER_NOISE]: 'Random Noise',
    [DistortionCode.X264]: 'X264'
}

const SPEND_MINUTES = 3;

export default {
    AVG_PIXEL_VALUE,
    BRUSH_THRESHOLD,
    DEFAULT_BRUSH_RADIUS,
    DistortionCode,
    DistortionCodeToDisplayMapping,
    DrawingAlgorithm,
    DrawingMode,
    MAX_ALPHA,
    MIN_ALPHA,
    SPEND_MINUTES,
    TIMELINE_WINDOW,
    VideoDimensions,
};

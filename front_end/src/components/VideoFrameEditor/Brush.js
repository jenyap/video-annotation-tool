import { Slider, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react';

import './Brush.css';
import consts from '../../consts';
import useKey from '../../customHooks/useKey';
import LockShortcutContext from '../../customHooks/lockShortcutContext';

const MIN_BRUSH_RADIUS = 10;
const MAX_BRUSH_RADIUS = 50;

function drawBrush(brushRadius, drawingMode) {
    const canvas = document.getElementById("brushCanvas");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = drawingMode === consts.DrawingMode.DRAW ? "#ff000077" : "#80808077";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        brushRadius,
        0,
        Math.PI * 2,
        true
    );
    ctx.fill();
}

function BrushCanvas(props) {
    const { brushRadius, drawingMode } = props;

    useEffect(() => {
        drawBrush(brushRadius, drawingMode);
    }, [brushRadius, drawingMode]);

    return (
        <div>
            <canvas id="brushCanvas" className='Brush-display-canvas' width="100" height="100" />
        </div>
    );
}

function Brush(props) {
    const { onBrushRadiusChange, drawingMode } = props;
    const [brushRadius, setBrushRadius] = useState(consts.DEFAULT_BRUSH_RADIUS);
    const { isLocked } = React.useContext(LockShortcutContext);


    const handleBrushRadiusChange = React.useCallback((newVal) => {
        setBrushRadius(newVal);
        onBrushRadiusChange(newVal);
    }, [onBrushRadiusChange]);

    const handleIncreaseBrushSizeShortcut = React.useCallback(() => {
        handleBrushRadiusChange(Math.min(brushRadius + 1, MAX_BRUSH_RADIUS))
    }, [brushRadius, handleBrushRadiusChange]);

    const handleDecreaseBrushSizeShortcut = React.useCallback(() => {
        handleBrushRadiusChange(Math.max(brushRadius - 1, MIN_BRUSH_RADIUS))
    }, [brushRadius, handleBrushRadiusChange])

    useKey("]", handleIncreaseBrushSizeShortcut, isLocked);
    useKey("[", handleDecreaseBrushSizeShortcut, isLocked);

    return (
        <div className='Brush'>
            <div>
                <Typography variant="h6" color="inherit">Brush Size: {brushRadius} px</Typography>
                {brushRadius != null && <Slider value={brushRadius} onChange={(e, newVal) => handleBrushRadiusChange(newVal)} min={MIN_BRUSH_RADIUS} max={MAX_BRUSH_RADIUS} />}
            </div>

            <BrushCanvas brushRadius={brushRadius} drawingMode={drawingMode} />
        </div>
    )
}

export default Brush;

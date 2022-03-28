import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { FormatPainterIcon, EraseToolIcon } from '@fluentui/react-icons-mdl2';
import React from "react";
import consts from "../../consts";
import useKey from "../../customHooks/useKey";
import LockShortcutContext from "../../customHooks/lockShortcutContext";

function DrawingMode(props) {
    const { drawingMode, onDrawingModeChange } = props;
    const { isLocked } = React.useContext(LockShortcutContext);

    const handleValueChange = React.useCallback((newVal) => {
        if (newVal !== null) {
            onDrawingModeChange(newVal);
        }
    }, [onDrawingModeChange]);

    const handleDrawShorcut = React.useCallback(() => {
        handleValueChange(consts.DrawingMode.DRAW);
    }, [handleValueChange]);

    const handleEraseShorcut = React.useCallback(() => {
        handleValueChange(consts.DrawingMode.ERASE);
    }, [handleValueChange]);

    useKey("c", handleDrawShorcut, isLocked);
    useKey("x", handleEraseShorcut, isLocked);

    return (
        <ToggleButtonGroup value={drawingMode} orientation="vertical"
            onChange={(e, newVal) => handleValueChange(newVal)}
            exclusive
            color="primary"
        >
            <ToggleButton value={consts.DrawingMode.DRAW} style={{ fontSize: '24px' }}>
                <FormatPainterIcon />
            </ToggleButton>
            <ToggleButton value={consts.DrawingMode.ERASE} style={{ fontSize: '24px' }}>
                <EraseToolIcon />
            </ToggleButton>
        </ToggleButtonGroup >
    )
}

export default DrawingMode;

import React, { useState } from 'react';
import LockShortcutContext from './lockShortcutContext';

function LockShortcutProvider(props) {
    const { children } = props;

    const setIsLocked = (newIsLockedValue) => {
        setLockedShortcutState(prevState => ({ ...prevState, isLocked: newIsLockedValue }))
    };

    const lockedShortcut = {
        isLocked: false,
        setIsLocked,
    };
    const [lockedShortcutState, setLockedShortcutState] = useState(lockedShortcut);

    return (
        <LockShortcutContext.Provider value={lockedShortcutState}>
            {children}
        </LockShortcutContext.Provider>
    )
}

export default LockShortcutProvider;
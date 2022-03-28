import React from "react";

const LockShortcutContext = React.createContext({
    isLocked: null,
    setIsLocked: (newIsLockedValue) => { },
});

export default LockShortcutContext;
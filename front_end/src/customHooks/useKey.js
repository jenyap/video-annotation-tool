import React from "react";

function useKey(key, callback, isLocked) {
    const callbackRef = React.useRef(callback);

    React.useEffect(() => {
        callbackRef.current = callback;
    });

    React.useEffect(() => {
        function handle(event) {
            if (isLocked) {
                return;
            }
            if (event.key === key) {
                callbackRef.current(event);
            }
        }

        document.addEventListener("keydown", handle);
        return () => document.removeEventListener("keydown", handle)
    }, [key, isLocked])
}

export default useKey;
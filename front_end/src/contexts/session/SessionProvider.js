import React, { useState } from 'react';
import SessionContext from './sessionContext';

function SessionProvider(props) {
    const { children } = props;

    const setSessionId = (newSessionId) => {
        setSessionState(prevState => ({ ...prevState, sessionId: newSessionId }))
    };

    const session = {
        sessionId: null,
        setSessionId,
    };
    const [sessionState, setSessionState] = useState(session);

    return (
        <SessionContext.Provider value={sessionState}>
            {children}
        </SessionContext.Provider>
    )
}

export default SessionProvider;
import React from "react";

const SessionContext = React.createContext({
    sessionId: null,
    setSessionId: (sessionId) => { },
});

export default SessionContext;
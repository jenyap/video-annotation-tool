import React from 'react';
import './App.css';
import { AppBar, Typography } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";


import LoadingProvider from './contexts/loading/LoadingProvider'
import SessionProvider from './contexts/session/SessionProvider';
import Panel from "./components/Panel";
import CompletedTask from './components/CompletedTask';

function App() {
  return (
    <div className="App">
      <AppBar position="static">
        <Typography variant="h4" color="inherit" component="div">
          Video Annotation Web Tool
        </Typography>
      </AppBar>
      <LoadingProvider>
        <SessionProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Panel />} />
              <Route path="/completed_task" element={<CompletedTask />} />
            </Routes>
          </Router>
        </SessionProvider>
      </LoadingProvider>
    </div>
  );
}

export default App;

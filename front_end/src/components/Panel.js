import React from 'react';
import PropTypes from 'prop-types';

import { Box, Tabs, Tab, Typography } from "@mui/material";
import Experiment from './Experiment';
import Interactive from './Interactive';
import Instructions from './Instructions';
import LoadingContext from '../contexts/loading/loadingContext';
import SessionContext from '../contexts/session/sessionContext';
import TaskProvider from '../contexts/task/TaskProvider'
import videoClient from '../videoClient';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography component={'span'} variant={'body2'}>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

function Panel() {
    const [value, setValue] = React.useState(0);

    const { showNetworkLoading, hideNetworkLoading, internalLoadingCount } = React.useContext(LoadingContext);
    const { setSessionId } = React.useContext(SessionContext)

    React.useEffect(() => {
        async function getSessionId() {
            showNetworkLoading();
            const res = await videoClient.getSessionId();
            setSessionId(res);
            hideNetworkLoading();
        }

        getSessionId();
    }, [showNetworkLoading, hideNetworkLoading, setSessionId]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <TaskProvider>
            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="Instructions" {...a11yProps(0)} disabled={!!internalLoadingCount} />
                        <Tab label="Task" {...a11yProps(1)} />
                    </Tabs>
                </Box>
                <TabPanel value={value} index={0}>
                    <Instructions />
                </TabPanel>
                <TabPanel value={value} index={1}>
                    <Experiment>
                        <Interactive />
                    </Experiment>
                </TabPanel>
            </Box>
        </TaskProvider>
    );
}

export default Panel;

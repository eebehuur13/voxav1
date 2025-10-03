import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography, Container } from '@mui/material';
import TTS from './TTS';
import STT from './STT';
import Translation from './Translation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
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
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Voxa Voice Agent
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="Text-to-Speech" />
            <Tab label="Speech-to-Text" />
            <Tab label="Translation" />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <TTS />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <STT />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Translation />
        </TabPanel>
      </Box>
    </Container>
  );
}

export default App;

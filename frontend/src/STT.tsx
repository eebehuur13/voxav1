import React, { useState } from 'react';
import { Button, Box, CircularProgress, Alert, Typography, Paper } from '@mui/material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

function STT() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [transcriptionResult, setTranscriptionResult] = useState<any>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setTranscriptionResult(null);
      setError('');
    }
  };

  const handleTranscribe = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setTranscriptionResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch(`${API_BASE_URL}/stt`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.details?.error?.message || result.error || 'Failed to transcribe audio');
      }

      setTranscriptionResult(result);

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 700 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="contained" component="label">
          Choose File
          <input type="file" hidden onChange={handleFileChange} accept="audio/*" />
        </Button>
        {selectedFile && <Typography>{selectedFile.name}</Typography>}
      </Box>

      <Box sx={{ position: 'relative' }}>
        <Button
          variant="contained"
          onClick={handleTranscribe}
          disabled={isLoading || !selectedFile}
          fullWidth
        >
          Transcribe
        </Button>
        {isLoading && (
          <CircularProgress
            size={24}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {transcriptionResult && (
        <Paper elevation={3} sx={{ p: 2, mt: 2, maxHeight: 400, overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>Transcription Result</Typography>
          <pre>{JSON.stringify(transcriptionResult, null, 2)}</pre>
        </Paper>
      )}
    </Box>
  );
}

export default STT;
import { useState } from 'react';
import { Button, Box, CircularProgress, Alert, Typography, Paper } from '@mui/material';
import Grid from '@mui/material/GridLegacy';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

function Translation() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    originalTranscript: string;
    translatedText: string;
  } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setResult(null);
      setError('');
    }
  };

  const handleTranslate = async () => {
    if (!selectedFile) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.details?.error?.message || data.error || 'Failed to process translation');
      }

      setResult({
        originalTranscript: data.original_transcript,
        translatedText: data.translated_text,
      });

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="contained" component="label">
          Choose Hindi Audio File
          <input type="file" hidden onChange={handleFileChange} accept="audio/*" />
        </Button>
        {selectedFile && <Typography>{selectedFile.name}</Typography>}
      </Box>

      <Box sx={{ position: 'relative' }}>
        <Button
          variant="contained"
          onClick={handleTranslate}
          disabled={isLoading || !selectedFile}
          fullWidth
        >
          Translate to English
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

      {result && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>Original (Hindi) Transcript</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{result.originalTranscript}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>English Translation</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{result.translatedText}</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

export default Translation;

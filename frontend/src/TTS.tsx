import { useState, useRef } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, Alert } from '@mui/material';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

function TTS() {
  const [text, setText] = useState('Hello, world! This is a test of the text-to-speech API.');
  const [voice, setVoice] = useState('alloy');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerateSpeech = async () => {
    setIsLoading(true);
    setError('');
    setAudioUrl('');

    try {
      const response = await fetch(`${API_BASE_URL}/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 500 }}>
      <TextField
        label="Text to Synthesize"
        multiline
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        variant="outlined"
        fullWidth
      />
      <FormControl fullWidth>
        <InputLabel id="voice-select-label">Voice</InputLabel>
        <Select
          labelId="voice-select-label"
          value={voice}
          label="Voice"
          onChange={(e) => setVoice(e.target.value)}
        >
          <MenuItem value="alloy">Alloy</MenuItem>
          <MenuItem value="onyx">Onyx</MenuItem>
          <MenuItem value="nova">Nova</MenuItem>
          <MenuItem value="shimmer">Shimmer</MenuItem>
          <MenuItem value="fable">Fable</MenuItem>
          <MenuItem value="echo">Echo</MenuItem>
        </Select>
      </FormControl>
      <Box sx={{ position: 'relative' }}>
        <Button
          variant="contained"
          onClick={handleGenerateSpeech}
          disabled={isLoading || !text}
          fullWidth
        >
          Generate Speech
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
      {audioUrl && (
        <audio controls src={audioUrl} ref={audioRef} autoPlay style={{ width: '100%' }}>
          Your browser does not support the audio element.
        </audio>
      )}
    </Box>
  );
}

export default TTS;

# Audio Chunking Fix - Automatic 30-Second Limit Handling

## Problem
Sarvam STT API has a 30-second limit for audio transcription. Users need to speak for longer than 30 seconds to give complete answers.

## Solution
**Automatic backend chunking** - The backend automatically splits long audio into 25-second chunks and transcribes each chunk separately.

## How It Works

### Frontend (Simple)
1. Records audio in WebM format (browser native)
2. Converts WebM to WAV using Web Audio API
3. Sends complete WAV file to backend
4. Backend handles everything else automatically

### Backend (Automatic Chunking)
1. Receives WAV audio file
2. Checks duration using WAV header
3. If duration > 30 seconds:
   - Splits audio into 25-second chunks
   - Transcribes each chunk separately
   - Combines all transcripts
4. Returns complete transcript

## Code Flow

```
User speaks for 45 seconds
    ↓
Frontend records WebM
    ↓
Frontend converts to WAV
    ↓
Frontend sends WAV to backend
    ↓
Backend detects 45s duration
    ↓
Backend splits into: [25s] [20s]
    ↓
Backend transcribes chunk 1 → "First part of answer..."
Backend transcribes chunk 2 → "Second part of answer..."
    ↓
Backend combines → "First part of answer... Second part of answer..."
    ↓
Returns complete transcript
```

## Key Functions

### Frontend
- `convertToWav()` - Converts WebM to WAV using Web Audio API
- `audioBufferToWav()` - Creates proper WAV file with RIFF header

### Backend
- `transcribe_audio()` - Main function that handles chunking
- `_get_audio_duration()` - Reads WAV duration from header
- `_split_audio_chunks()` - Splits WAV into 25s chunks
- `_transcribe_single_chunk()` - Transcribes one chunk

## Benefits
- ✅ User can speak for ANY duration (no limit)
- ✅ Fully automatic - no manual intervention
- ✅ Works with browser's native WebM recording
- ✅ Proper WAV format for accurate chunking
- ✅ Backend handles all complexity

## Testing
1. Start interview
2. Speak for more than 30 seconds (e.g., 45 seconds)
3. Check backend logs for:
   - "Audio duration: 45.00 seconds"
   - "Splitting into 25-second chunks..."
   - "Split into 2 chunks"
   - "Transcribing chunk 1/2..."
   - "Transcribing chunk 2/2..."
   - "STT Success - Combined transcript"

# 🔊 Fix Audio Issues - AI Not Speaking

## Issues Found

1. **AI not speaking after introduction**: ffmpeg not installed on Render
2. **Transcription failed**: Audio format conversion failing

## Root Cause

Your logs show:
```
Error converting audio to WAV: [Errno 2] No such file or directory: 'ffmpeg'
```

ffmpeg is required for audio processing but not installed on Render.

## What I Fixed

1. ✅ Updated `render.yaml` to install ffmpeg during build
2. ✅ Added `pydub` and `wave` to requirements.txt for audio processing

## Deploy the Fix

### Step 1: Commit and Push
```bash
git add .
git commit -m "Fix: Add ffmpeg for audio processing"
git push
```

### Step 2: Redeploy on Render
1. Go to https://render.com/dashboard
2. Select your backend service
3. Click "Manual Deploy" → "Clear build cache & deploy"
4. Wait 3-5 minutes (ffmpeg installation takes time)
5. Check logs for: "Successfully installed ffmpeg"

### Step 3: Test
1. Go to your app
2. Start a new interview
3. AI should speak all questions ✓
4. Your answers should be transcribed ✓

## Expected Behavior After Fix

### Question Flow
1. AI generates question ✓
2. TTS creates audio ✓
3. Audio plays in browser ✓
4. You answer ✓
5. Audio is transcribed ✓
6. Next question ✓

### Logs Should Show
```
TTS Success - Generated audio
[AUDIO] Question audio saved successfully
[ANSWER AUDIO] Answer audio saved successfully
Audio converted to WAV successfully
Transcription successful
```

## Why This Happened

Render's Python environment doesn't include ffmpeg by default. We need to explicitly install it in the build command.

## Files Changed

- `backend/render.yaml` - Added ffmpeg installation
- `backend/requirements.txt` - Added pydub and wave

## Troubleshooting

### Still no audio after deployment?

**Check Render logs for:**
```
apt-get update && apt-get install -y ffmpeg
```

Should see:
```
Setting up ffmpeg...
Done
```

### Transcription still failing?

**Check logs for:**
```
Error converting audio to WAV
```

If you see this, ffmpeg didn't install. Try:
1. Delete the service on Render
2. Create new service
3. Use the updated render.yaml

### Audio plays but transcription fails?

Check Sarvam API key is set in Render environment variables:
```
SARVAM_API_KEY=sk_wnijjvf0_elEfAcD7M8EudN6d62dedozt
```

## Alternative: Use Docker

If ffmpeg installation fails, you can use Docker instead:

Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Install Python dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy app
COPY . /app
WORKDIR /app

# Run
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Then in Render, select "Docker" instead of "Python".

## Summary

✅ Added ffmpeg installation to render.yaml  
✅ Added audio processing libraries  
✅ Ready to deploy  

**Just push to GitHub and redeploy on Render!** 🚀

**Build will take 3-5 minutes due to ffmpeg installation.**

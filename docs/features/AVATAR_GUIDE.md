# 👤 Avatar Guide - AI Interview Platform

## 📍 Avatar Location & Structure

### Avatar Files Location
```
frontend/
├── public/
│   ├── avatar.mp4         (603 KB) - Male avatar (Aarush) 👨‍💼
│   ├── avatar_female.mp4  (701 KB) - Female avatar (Aarushi) 👩‍💼
│   └── avatar1.mp4        (345 KB) - Alternative avatar
```

### How Avatars Work

The avatars are **video files** (MP4 format) that:
- ✅ Loop continuously during the interview
- ✅ Play when the AI is speaking
- ✅ Pause when listening to candidate answers
- ✅ Give a professional, realistic interviewer appearance

## 🎬 Avatar Component

### Main Component: `ProfessionalVideoAvatar.jsx`

**Location:** `frontend/src/components/ProfessionalVideoAvatar.jsx`

**Props:**
```jsx
<ProfessionalVideoAvatar 
  state="speaking" | "idle" | "listening"
  subtitle="Current question or status"
  avatarType="male" | "female"
/>
```

**States:**
- `speaking` - Video plays (AI asking question)
- `idle` - Video paused (waiting)
- `listening` - Video paused (candidate answering)

### Code Snippet
```jsx
const avatarVideoUrl = avatarType === 'female' 
  ? "/avatar_female.mp4"  // Aarushi 👩‍💼
  : "/avatar.mp4"          // Aarush 👨‍💼

<video
  ref={videoRef}
  src={avatarVideoUrl}
  loop
  muted
  playsInline
  className="w-full h-full object-cover"
/>
```

## 🎨 Current Avatar Characters

### 1. **Aarush** (Male Avatar) 👨‍💼
- **File:** `avatar.mp4`
- **Size:** 603 KB
- **Character:** Professional male interviewer
- **Usage:** Default avatar

### 2. **Aarushi** (Female Avatar) 👩‍💼
- **File:** `avatar_female.mp4`
- **Size:** 701 KB
- **Character:** Professional female interviewer
- **Usage:** Alternative option

### 3. **Alternative Avatar**
- **File:** `avatar1.mp4`
- **Size:** 345 KB
- **Status:** Not currently used in production code

## 🚀 How to Change Avatars

### Option 1: Switch Between Existing Avatars

In your interview start component, change the `avatarType` prop:

```jsx
// Use male avatar
<ProfessionalVideoAvatar avatarType="male" />

// Use female avatar
<ProfessionalVideoAvatar avatarType="female" />
```

### Option 2: Add New Avatar Videos

1. **Prepare your video:**
   - Format: MP4
   - Recommended size: < 1 MB
   - Duration: 5-10 seconds (will loop)
   - Resolution: 720p or 1080p
   - Content: Head and shoulders shot, professional background

2. **Add to project:**
   ```bash
   # Copy your video to public folder
   cp your_new_avatar.mp4 frontend/public/
   ```

3. **Update component:**
   ```jsx
   // In ProfessionalVideoAvatar.jsx
   const avatarVideoUrl = avatarType === 'female' 
     ? "/avatar_female.mp4"
     : avatarType === 'custom'
     ? "/your_new_avatar.mp4"
     : "/avatar.mp4"
   ```

## 🎥 Creating Your Own Avatar Videos

### Method 1: Use AI Avatar Generators

**Recommended Services:**

1. **D-ID** (https://www.d-id.com/)
   - Upload photo → Generates talking avatar
   - Free tier available
   - Export as MP4

2. **Synthesia** (https://www.synthesia.io/)
   - AI avatars with text-to-speech
   - Professional quality
   - Paid service

3. **HeyGen** (https://www.heygen.com/)
   - Create AI avatars from photos
   - Multiple avatar styles
   - Free trial available

### Method 2: Record Real Person

```bash
# Requirements:
- Webcam or phone camera
- Good lighting (face the light source)
- Plain/professional background
- 5-10 second loop of natural movements
- Neutral expression
```

**Recording Tips:**
- Stand still (slight natural movements only)
- Professional attire
- Neutral expression or slight smile
- Record in 1920x1080 resolution
- Keep file size under 1 MB (compress if needed)

### Method 3: Use Stock Video

**Stock Video Sites:**
- Pexels (https://www.pexels.com/videos/)
- Pixabay (https://pixabay.com/videos/)
- Videvo (https://www.videvo.net/)

Search for: "professional portrait", "business person", "interview"

## 🔧 Technical Details

### Video Specifications

| Property | Value | Notes |
|----------|-------|-------|
| **Format** | MP4 (H.264) | Best browser compatibility |
| **Size** | < 1 MB | Recommended for fast loading |
| **Duration** | 5-10 seconds | Will loop seamlessly |
| **Resolution** | 720p - 1080p | Balance quality & size |
| **Frame Rate** | 24-30 fps | Standard video rates |
| **Audio** | Muted | Not needed (TTS plays separately) |

### Optimizing Video Files

```bash
# Install FFmpeg (if not installed)
brew install ffmpeg  # macOS
# or
sudo apt install ffmpeg  # Linux

# Compress video while maintaining quality
ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset fast output.mp4

# Convert to web-optimized MP4
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -movflags +faststart output.mp4

# Resize to 720p (if too large)
ffmpeg -i input.mp4 -vf scale=1280:720 -c:a copy output_720p.mp4
```

## 🎯 Avatar Behavior in Interview

### Interview Flow with Avatar

```
1. Interview Starts
   ├─ Avatar: idle (paused)
   └─ Displays: "Welcome to your interview"

2. AI Asks Question
   ├─ Avatar: speaking (playing)
   ├─ TTS Audio: Plays question
   └─ Subtitle: Shows question text

3. Waiting for Answer
   ├─ Avatar: listening (paused)
   ├─ Microphone: Active
   └─ Subtitle: "Listening to your answer..."

4. Processing Answer
   ├─ Avatar: idle (paused)
   └─ Subtitle: "Evaluating your response..."

5. Next Question
   └─ Loop back to step 2
```

### State Transitions

```jsx
// In InterviewRoom.jsx
const [avatarState, setAvatarState] = useState('idle')

// When playing question audio
setAvatarState('speaking')

// When recording answer
setAvatarState('listening')

// When processing
setAvatarState('idle')
```

## 🌐 Deployment Considerations

### Vercel Deployment

Your avatars are in the `public/` folder, so they're automatically served by Vercel:

```
https://your-app.vercel.app/avatar.mp4
https://your-app.vercel.app/avatar_female.mp4
```

**No extra configuration needed!** ✅

### Size Optimization for Production

If avatars are too large:

1. **Compress videos** (see FFmpeg commands above)
2. **Use CDN** for faster delivery:
   ```jsx
   const avatarVideoUrl = 'https://cdn.yoursite.com/avatars/avatar.mp4'
   ```
3. **Lazy load** videos:
   ```jsx
   <video loading="lazy" preload="metadata" />
   ```

## 🎨 Customization Ideas

### Add Multiple Avatar Options

Let HR choose avatar during job creation:

```jsx
// In job creation form
<select name="avatarType">
  <option value="male">Aarush (Male)</option>
  <option value="female">Aarushi (Female)</option>
  <option value="custom1">Professional 1</option>
  <option value="custom2">Professional 2</option>
</select>
```

### Dynamic Avatar Selection

Based on job type:
```jsx
const getAvatarForJob = (jobTitle) => {
  if (jobTitle.includes('Engineering')) return 'male'
  if (jobTitle.includes('HR')) return 'female'
  return 'male' // default
}
```

### Add Avatar Emotions

Create different videos for different states:
```
avatar_speaking.mp4  - Talking animation
avatar_listening.mp4 - Attentive listening
avatar_thinking.mp4  - Thoughtful expression
```

## 🐛 Troubleshooting

### Avatar Not Showing

**Issue:** Black screen instead of avatar

**Solutions:**
1. Check file exists:
   ```bash
   ls frontend/public/avatar.mp4
   ```

2. Check browser console for errors:
   ```
   Video load error: Failed to load resource
   ```

3. Verify video format:
   ```bash
   ffprobe frontend/public/avatar.mp4
   ```

4. Test video directly:
   ```
   http://localhost:5173/avatar.mp4
   ```

### Avatar Not Playing

**Issue:** Video frozen/not animating

**Check:**
1. State is set to `'speaking'`:
   ```jsx
   console.log('Avatar state:', avatarState)
   ```

2. Video has `loop` attribute
3. Video is not muted by browser autoplay policy

**Fix:**
```jsx
videoRef.current.play().catch(e => {
  console.error('Autoplay blocked:', e)
  // Fallback: Show play button
})
```

### Video Too Large / Slow Loading

**Solutions:**
1. Compress video (see FFmpeg section)
2. Reduce resolution to 720p
3. Shorten video duration to 3-5 seconds
4. Use lower bitrate

## 📊 Current Usage

### Where Avatars Are Used

1. **Interview Room** (`InterviewRoom.jsx`)
   - Main interview screen
   - Shows during questions and answers

2. **Professional Video Avatar Component** (`ProfessionalVideoAvatar.jsx`)
   - Reusable component
   - Handles video playback logic

### File References

```javascript
// Default male avatar
/avatar.mp4 → Aarush 👨‍💼 (603 KB)

// Female avatar option
/avatar_female.mp4 → Aarushi 👩‍💼 (701 KB)

// Unused (can be deleted or used as alternative)
/avatar1.mp4 → Alternative avatar (345 KB)
```

## 🎯 Best Practices

1. ✅ **Keep files small** (< 1 MB per video)
2. ✅ **Use consistent resolution** (all avatars same size)
3. ✅ **Test on mobile devices** (autoplay may be blocked)
4. ✅ **Add fallback** (show static image if video fails)
5. ✅ **Optimize for web** (use H.264 codec, faststart flag)
6. ✅ **Version control** (Git LFS for large files, or use CDN)

## 🚀 Future Enhancements

### Ideas to Consider

1. **Real-time Lip Sync**
   - Use services like D-ID or Synthesia API
   - Sync avatar lips with TTS audio

2. **Interactive Avatars**
   - Different expressions for different scenarios
   - Smile when candidate does well
   - Concerned look for poor answers

3. **Custom Avatars per Company**
   - Allow HR to upload their own avatar
   - Company branding

4. **3D Avatars**
   - Use Three.js or Ready Player Me
   - More engaging and modern

5. **Live Avatar Animation**
   - Use WebRTC with services like Wav2Lip
   - Real-time animated avatar

## 📝 Summary

- ✅ **3 avatar videos** in `frontend/public/`
- ✅ **Male (Aarush) and Female (Aarushi)** options available
- ✅ **Video-based** (MP4 loops)
- ✅ **Easy to customize** (just replace MP4 files)
- ✅ **Deployed on Vercel** (automatically served)

Your avatars are working perfectly! They give a professional, human touch to the AI interview experience. 🎭✨

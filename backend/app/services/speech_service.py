"""Speech service for STT and TTS using Sarvam APIs."""
import httpx
import base64
import io
import wave
import subprocess
import tempfile
from pathlib import Path
from typing import Optional
from ..config import settings


class SpeechService:
    """Service for speech-to-text and text-to-speech operations."""
    
    def __init__(self):
        self.stt_url = settings.SARVAM_STT_URL
        self.tts_url = settings.SARVAM_TTS_URL
        self.api_key = settings.SARVAM_API_KEY
        self.headers = {
            "api-subscription-key": self.api_key,
            "Content-Type": "application/json"
        }
    
    def _convert_to_wav(self, audio_bytes: bytes) -> Optional[bytes]:
        """Convert any audio format to WAV using ffmpeg."""
        try:
            # Create temp files
            with tempfile.NamedTemporaryFile(delete=False, suffix='.input') as input_file:
                input_file.write(audio_bytes)
                input_path = input_file.name
            
            output_path = input_path.replace('.input', '.wav')
            
            # Convert to WAV using ffmpeg
            cmd = [
                'ffmpeg', '-i', input_path,
                '-acodec', 'pcm_s16le',
                '-ar', '16000',
                '-ac', '1',
                '-y',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                print(f"FFmpeg error: {result.stderr}")
                # Clean up
                Path(input_path).unlink(missing_ok=True)
                return None
            
            # Read converted WAV
            with open(output_path, 'rb') as f:
                wav_bytes = f.read()
            
            # Clean up temp files
            Path(input_path).unlink(missing_ok=True)
            Path(output_path).unlink(missing_ok=True)
            
            return wav_bytes
            
        except Exception as e:
            print(f"Error converting audio to WAV: {e}")
            return None
    
    def _get_audio_duration(self, audio_bytes: bytes) -> float:
        """Get duration of WAV audio in seconds."""
        try:
            with io.BytesIO(audio_bytes) as audio_io:
                with wave.open(audio_io, 'rb') as wav_file:
                    frames = wav_file.getnframes()
                    rate = wav_file.getframerate()
                    duration = frames / float(rate)
                    return duration
        except Exception as e:
            print(f"Error getting audio duration: {e}")
            return 0.0
    
    def _split_audio_chunks(self, audio_bytes: bytes, chunk_duration: float = 25.0) -> list[bytes]:
        """
        Split audio into chunks of specified duration (in seconds).
        Default is 25 seconds to stay under Sarvam's 30-second limit with buffer.
        """
        try:
            chunks = []
            with io.BytesIO(audio_bytes) as audio_io:
                with wave.open(audio_io, 'rb') as wav_file:
                    params = wav_file.getparams()
                    rate = params.framerate
                    frames_per_chunk = int(rate * chunk_duration)
                    
                    while True:
                        frames = wav_file.readframes(frames_per_chunk)
                        if not frames:
                            break
                        
                        # Create a new WAV file for this chunk
                        chunk_io = io.BytesIO()
                        with wave.open(chunk_io, 'wb') as chunk_wav:
                            chunk_wav.setparams(params)
                            chunk_wav.writeframes(frames)
                        
                        chunks.append(chunk_io.getvalue())
            
            return chunks
        except Exception as e:
            print(f"Error splitting audio: {e}")
            return [audio_bytes]  # Return original if splitting fails
    
    async def _transcribe_single_chunk(self, audio_bytes: bytes, language: str = "en-IN") -> Optional[str]:
        """Transcribe a single audio chunk (must be < 30 seconds)."""
        try:
            files = {
                "file": ("audio.wav", audio_bytes, "audio/wav")
            }
            
            data = {
                "language_code": language,
                "model": "saarika:v2.5"
            }
            
            headers = {
                "api-subscription-key": self.api_key
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    self.stt_url,
                    files=files,
                    data=data,
                    headers=headers
                )
                
                if response.status_code == 200:
                    result = response.json()
                    transcript = result.get("transcript", "")
                    return transcript
                else:
                    print(f"STT API error: {response.status_code} - {response.text}")
                    return None
        except Exception as e:
            print(f"Error in _transcribe_single_chunk: {e}")
            return None
    
    async def transcribe_audio(self, audio_bytes: bytes, language: str = "en-IN") -> Optional[str]:
        """
        Transcribe audio to text using Sarvam STT API.
        Automatically handles audio longer than 30 seconds by splitting into chunks.
        """
        try:
            # Try to get duration first
            duration = self._get_audio_duration(audio_bytes)
            
            print(f"Audio duration: {duration:.2f} seconds" if duration > 0 else "Audio duration: unknown")
            
            # If duration is known and under 30 seconds, transcribe directly
            if duration > 0 and duration <= 30.0:
                print(f"Audio under 30s, transcribing directly...")
                transcript = await self._transcribe_single_chunk(audio_bytes, language)
                if transcript:
                    print(f"STT Success - Transcript: {transcript[:100]}...")
                    return transcript
            
            # If duration is known and over 30 seconds, split into chunks
            if duration > 30.0:
                print(f"Audio exceeds 30s limit ({duration:.2f}s), splitting into chunks...")
                chunks = self._split_audio_chunks(audio_bytes, chunk_duration=25.0)
                print(f"Split into {len(chunks)} chunks")
                
                # Transcribe each chunk
                transcripts = []
                for i, chunk in enumerate(chunks):
                    chunk_duration = self._get_audio_duration(chunk)
                    print(f"Transcribing chunk {i+1}/{len(chunks)} ({chunk_duration:.2f}s)...")
                    
                    transcript = await self._transcribe_single_chunk(chunk, language)
                    if transcript:
                        transcripts.append(transcript)
                    else:
                        print(f"Warning: Failed to transcribe chunk {i+1}")
                
                # Combine all transcripts
                if transcripts:
                    full_transcript = " ".join(transcripts)
                    print(f"STT Success - Combined transcript: {full_transcript[:100]}...")
                    return full_transcript
                else:
                    print("Failed to transcribe any chunks")
                    return None
            
            # If duration is unknown, try direct transcription anyway
            print(f"Duration unknown, attempting direct transcription...")
            transcript = await self._transcribe_single_chunk(audio_bytes, language)
            if transcript:
                print(f"STT Success - Transcript: {transcript[:100]}...")
                return transcript
            
            print("Direct transcription failed, audio might be too long or invalid format")
            return None
                
        except Exception as e:
            print(f"Error in transcribe_audio: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    async def synthesize_speech(
        self,
        text: str,
        language: str = "en-IN",
        speaker: str = "abhilash"
    ) -> Optional[bytes]:
        """
        Convert text to speech using Sarvam TTS API.
        
        Available speakers (from API):
        Male: arya, abhilash, karun, hitesh, aditya, chirag, harsh, rahul, rohan, 
              vikram, rajesh, anirudh, ishaan
        Female: anushka, manisha, vidya, isha, ritu, sakshi, priya, neha, pooja, 
                simran, kavya, anjali, sneha, kiran, sunita, tara, kriti
        """
        try:
            payload = {
                "inputs": [text],
                "target_language_code": language,
                "speaker": speaker,  # Use the speaker parameter
                "model": "bulbul:v2",         
                "enable_preprocessing": True
            }
            
            print(f"TTS Request - Speaker: {speaker}, Text length: {len(text)}")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.tts_url,
                    json=payload,
                    headers=self.headers
                )
                
                if response.status_code == 200:
                    result = response.json()
                    audios = result.get("audios", [])
                    if audios:
                        audio_bytes = base64.b64decode(audios[0])
                        print(f"TTS Success - Generated {len(audio_bytes)} bytes with speaker: {speaker}")
                        return audio_bytes
                    else:
                        print("TTS API returned no audio data")
                        return None
                else:
                    print(f"TTS API error: {response.status_code} - {response.text}")
                    return None
        except Exception as e:
            print(f"Error in synthesize_speech: {e}")
            import traceback
            traceback.print_exc()
            return None


# Singleton instance
speech_service = SpeechService()

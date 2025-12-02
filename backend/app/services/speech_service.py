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
        """Convert any audio format to WAV using pydub."""
        try:
            from pydub import AudioSegment
            import io
            
            print("🔄 Converting audio to WAV using pydub...")
            
            # Create temp files
            with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as input_file:
                input_file.write(audio_bytes)
                input_path = input_file.name
            
            print(f"Input file: {input_path}")
            
            # Load audio using pydub (supports webm, mp3, etc.)
            audio = AudioSegment.from_file(input_path, format="webm")
            print(f"Audio loaded: {len(audio)}ms, {audio.frame_rate}Hz, {audio.channels} channels")
            
            # Convert to mono 16kHz for better STT
            audio = audio.set_frame_rate(16000).set_channels(1)
            print(f"Converted to: 16000Hz, mono")
            
            # Export as WAV
            output_buffer = io.BytesIO()
            audio.export(output_buffer, format="wav")
            wav_bytes = output_buffer.getvalue()
            
            print(f"✅ WAV conversion successful: {len(wav_bytes)} bytes")
            
            # Clean up temp file
            Path(input_path).unlink(missing_ok=True)
            
            return wav_bytes
            
        except Exception as e:
            print(f"❌ Error converting audio to WAV: {e}")
            import traceback
            traceback.print_exc()
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
        ONLY accepts WAV format. Frontend must convert to WAV.
        Automatically splits WAV files longer than 30 seconds.
        """
        try:
            # Get duration from WAV header
            duration = self._get_audio_duration(audio_bytes)
            
            if duration <= 0:
                print(f"❌ Invalid WAV file - cannot read duration")
                print(f"File size: {len(audio_bytes)} bytes")
                print(f"Expected: WAV file with RIFF header")
                return None
            
            print(f"✅ WAV audio duration: {duration:.2f} seconds")
            
            # If duration is under 30 seconds, transcribe directly
            if duration <= 30.0:
                print(f"✅ Audio under 30s, transcribing directly...")
                transcript = await self._transcribe_single_chunk(audio_bytes, language)
                if transcript:
                    print(f"✅ STT Success: {transcript[:100]}...")
                    return transcript
                else:
                    print(f"❌ Transcription failed")
                    return None
            
            # If duration is over 30 seconds, split into 25-second chunks
            print(f"⚠️ Audio exceeds 30s limit ({duration:.2f}s)")
            print(f"🔄 Splitting into 25-second chunks...")
            
            chunks = self._split_audio_chunks(audio_bytes, chunk_duration=25.0)
            print(f"✅ Split into {len(chunks)} chunks")
            
            # Transcribe each chunk
            transcripts = []
            for i, chunk in enumerate(chunks):
                chunk_duration = self._get_audio_duration(chunk)
                print(f"📤 Transcribing chunk {i+1}/{len(chunks)} ({chunk_duration:.2f}s)...")
                
                transcript = await self._transcribe_single_chunk(chunk, language)
                if transcript:
                    transcripts.append(transcript)
                    print(f"✅ Chunk {i+1}: {transcript[:50]}...")
                else:
                    print(f"❌ Chunk {i+1} failed")
            
            # Combine all transcripts
            if transcripts:
                full_transcript = " ".join(transcripts)
                print(f"✅ Combined transcript ({len(transcripts)} chunks): {full_transcript[:200]}...")
                return full_transcript
            else:
                print("❌ Failed to transcribe any chunks")
                return None
                
        except Exception as e:
            print(f"❌ Error in transcribe_audio: {e}")
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

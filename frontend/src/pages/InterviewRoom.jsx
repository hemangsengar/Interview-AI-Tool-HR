import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AudioVisualizer from '../components/AudioVisualizer'
import CodeEditor from '../components/CodeEditor'
import { interviewService } from '../api/services'

const InterviewRoom = () => {
  const { sessionId } = useParams()
  const navigate = useNavigate()

  const [avatarState, setAvatarState] = useState('idle')
  const [subtitle, setSubtitle] = useState('')
  const [status, setStatus] = useState('Not Started')
  const [isRecording, setIsRecording] = useState(false)
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [interviewComplete, setInterviewComplete] = useState(false)
  const [error, setError] = useState('')
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [videoStream, setVideoStream] = useState(null)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [recordingStatus, setRecordingStatus] = useState('')
  const [showRecordingAlert, setShowRecordingAlert] = useState(false)
  const [isVideoRecording, setIsVideoRecording] = useState(false)
  const [showInterviewerSelection, setShowInterviewerSelection] = useState(true)
  const [selectedInterviewer, setSelectedInterviewer] = useState(null) // 'aarush' or 'aarushi'
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [permissionError, setPermissionError] = useState('')

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const audioRef = useRef(new Audio())
  const mediaStreamRef = useRef(null) // Store media stream
  const videoRef = useRef(null) // For welcome screen preview
  const interviewVideoRef = useRef(null) // For interview screen
  const videoRecorderRef = useRef(null)
  const videoChunksRef = useRef([])
  const recordedVideoBlob = useRef(null)


  useEffect(() => {
    // Request microphone and camera permission on mount
    const initMedia = async () => {
      try {
        console.log('Requesting camera and microphone access...')
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 },
            facingMode: 'user'
          }
        })
        console.log('✅ Media permissions granted!')
        console.log('Media stream obtained:', stream.id)
        console.log('Video tracks:', stream.getVideoTracks().length)
        console.log('Audio tracks:', stream.getAudioTracks().length)

        setVideoStream(stream)
        setPermissionsGranted(true)
        setPermissionError('')

        // Set video stream immediately and after delay
        if (videoRef.current) {
          console.log('Setting video srcObject')
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded')
            videoRef.current.play()
              .then(() => console.log('Video playing'))
              .catch(e => console.error('Video play error:', e))
          }
        }

        // Also try after delay
        setTimeout(() => {
          if (videoRef.current && stream) {
            console.log('Setting video srcObject (delayed)')
            videoRef.current.srcObject = stream
            videoRef.current.play().catch(e => console.log('Video play error (delayed):', e))
          }
        }, 500)
      } catch (err) {
        console.error('❌ Media permission error:', err)
        setPermissionsGranted(false)

        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionError('Camera and microphone access denied. Please allow permissions to continue.')
        } else if (err.name === 'NotFoundError') {
          setPermissionError('No camera or microphone found. Please connect devices to continue.')
        } else {
          setPermissionError('Failed to access camera/microphone. Please check your device settings.')
        }
        setError('Camera/Microphone access denied. Please enable them for an authentic interview experience.')
      }
    }
    // Check session status on mount
    const checkSessionStatus = async () => {
      try {
        const response = await interviewService.getSession(sessionId)
        const sessionData = response.data
        if (sessionData.status === 'in_progress' || sessionData.status === 'completed') {
          console.log('[Interview] Session already in progress/completed, recovering...')
          setInterviewStarted(true)
          if (sessionData.status === 'completed') {
            setInterviewComplete(true)
          } else {
            // If in progress, fetch the first/current question
            await getNextQuestion()
          }
        }
      } catch (err) {
        console.error('Failed to fetch session status:', err)
      }
    }

    initMedia()
    checkSessionStatus()

    return () => {
      // Cleanup video stream on unmount
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [sessionId])

  // Cleanup on interview complete
  useEffect(() => {
    if (interviewComplete && videoStream) {
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
      if (interviewVideoRef.current) {
        interviewVideoRef.current.srcObject = null
      }
    }
  }, [interviewComplete, videoStream])

  useEffect(() => {
    if (videoRef.current && videoStream) {
      console.log('Video ref and stream available, setting srcObject')
      videoRef.current.srcObject = videoStream
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded in effect')
        videoRef.current.play()
          .then(() => console.log('Video playing in effect'))
          .catch(e => console.error('Video play error in effect:', e))
      }
    }
  }, [videoStream])

  // Set stream on interview video when interview starts
  useEffect(() => {
    if (interviewStarted && interviewVideoRef.current && videoStream) {
      console.log('Setting stream on interview video')
      interviewVideoRef.current.srcObject = videoStream
      interviewVideoRef.current.play()
        .then(() => console.log('Interview video playing'))
        .catch(e => console.error('Interview video play error:', e))
    }
  }, [interviewStarted, videoStream])

  // SIMPLIFIED VIDEO RECORDING - Start
  const startVideoRecording = () => {
    console.log('🎬 START VIDEO RECORDING CALLED')
    console.log('Video stream exists:', !!videoStream)
    console.log('Session ID:', sessionId)

    if (!videoStream) {
      console.error('❌ NO VIDEO STREAM - Cannot start recording')
      return false
    }

    console.log('✅ Video stream available, creating recorder...')

    try {
      // Simple options - use browser default if needed
      let options = { videoBitsPerSecond: 250000, audioBitsPerSecond: 64000 }

      // Try to use webm
      if (MediaRecorder.isTypeSupported('video/webm')) {
        options.mimeType = 'video/webm'
        console.log('✅ Using video/webm')
      } else {
        console.log('⚠️ Using browser default codec')
      }

      const recorder = new MediaRecorder(videoStream, options)
      videoChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          videoChunksRef.current.push(e.data)
          console.log(`📹 Chunk ${videoChunksRef.current.length}: ${e.data.size} bytes`)
        }
      }

      recorder.onstop = () => {
        console.log('⏹️ RECORDER STOPPED')
        console.log(`Total chunks: ${videoChunksRef.current.length}`)

        if (videoChunksRef.current.length > 0) {
          const blob = new Blob(videoChunksRef.current, { type: 'video/webm' })
          recordedVideoBlob.current = blob
          console.log(`✅ VIDEO BLOB CREATED: ${(blob.size / 1024 / 1024).toFixed(2)} MB`)
        } else {
          console.error('❌ NO CHUNKS COLLECTED')
        }
      }

      recorder.onerror = (e) => {
        console.error('❌ RECORDER ERROR:', e)
      }

      recorder.start(1000) // Collect data every second
      videoRecorderRef.current = recorder
      setIsVideoRecording(true)

      console.log('✅ RECORDING STARTED - State:', recorder.state)

      // Show alert
      setRecordingStatus('🔴 Video Recording in Progress')
      setShowRecordingAlert(true)
      setTimeout(() => setShowRecordingAlert(false), 5000)

      return true
    } catch (err) {
      console.error('❌ START RECORDING ERROR:', err)
      return false
    }
  }

  // SIMPLIFIED VIDEO RECORDING - Stop and Upload
  const stopAndUploadVideo = async () => {
    console.log('🛑 STOPPING VIDEO RECORDING')
    console.log('Recorder exists:', !!videoRecorderRef.current)
    console.log('Recorder state:', videoRecorderRef.current?.state)
    console.log('Chunks collected so far:', videoChunksRef.current.length)

    if (!videoRecorderRef.current) {
      console.error('❌ NO RECORDER FOUND - Recording never started!')
      return false
    }

    if (videoRecorderRef.current.state === 'inactive') {
      console.log('⚠️ Recorder already stopped')
      // Try to upload anyway if we have chunks
      if (videoChunksRef.current.length > 0) {
        console.log('⚠️ But we have chunks, creating blob manually...')
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' })
        recordedVideoBlob.current = blob
        console.log(`✅ Manual blob created: ${(blob.size / 1024 / 1024).toFixed(2)} MB`)
      } else {
        console.error('❌ No chunks to upload')
        return false
      }
    } else {
      // Stop the recorder
      console.log('Stopping recorder...')
      videoRecorderRef.current.stop()
      setIsVideoRecording(false)
    }

    // Show paused alert
    setRecordingStatus('⏸️ Video Recording Paused - Saving...')
    setShowRecordingAlert(true)

    return new Promise((resolve) => {
      // Wait for onstop to fire and blob to be created
      setTimeout(async () => {
        console.log('Checking for blob after wait...')
        console.log('Blob exists:', !!recordedVideoBlob.current)
        console.log('Chunks available:', videoChunksRef.current.length)

        // If no blob but we have chunks, create it manually
        if (!recordedVideoBlob.current && videoChunksRef.current.length > 0) {
          console.log('⚠️ Creating blob manually from chunks...')
          const blob = new Blob(videoChunksRef.current, { type: 'video/webm' })
          recordedVideoBlob.current = blob
          console.log(`✅ Manual blob: ${(blob.size / 1024 / 1024).toFixed(2)} MB`)
        }

        if (!recordedVideoBlob.current) {
          console.error('❌ NO VIDEO BLOB CREATED')
          console.error('This means no video data was recorded!')
          setRecordingStatus('❌ Video recording failed - no data')
          setTimeout(() => setShowRecordingAlert(false), 3000)
          resolve(false)
          return
        }

        const blob = recordedVideoBlob.current
        const sizeMB = (blob.size / 1024 / 1024).toFixed(2)
        console.log('📤 UPLOADING VIDEO:', sizeMB, 'MB')
        console.log('Session ID:', sessionId)
        console.log('Blob size:', blob.size, 'bytes')

        if (blob.size === 0) {
          console.error('❌ BLOB IS EMPTY!')
          resolve(false)
          return
        }

        try {
          console.log('Creating FormData...')
          const formData = new FormData()
          formData.append('video_file', blob, `interview_${sessionId}.webm`)
          console.log('FormData created, calling upload API...')

          const response = await interviewService.uploadVideo(sessionId, formData)
          console.log('✅ UPLOAD SUCCESS:', response.data)
          console.log('Response:', JSON.stringify(response.data, null, 2))

          // Show success alert
          setRecordingStatus(`✅ Video Saved`)
          setTimeout(() => setShowRecordingAlert(false), 3000)

          resolve(true)
        } catch (err) {
          console.error('❌ UPLOAD FAILED:', err)
          console.error('Error details:', err.response?.data)
          console.error('Error status:', err.response?.status)
          setRecordingStatus('❌ Upload failed')
          setTimeout(() => setShowRecordingAlert(false), 3000)
          resolve(false)
        }
      }, 2000) // Wait 2 seconds for blob creation
    })
  }

  const startInterview = async () => {
    try {
      setStatus('Starting interview...')
      setInterviewStarted(true)

      // Start video recording
      const recordingStarted = startVideoRecording()
      if (!recordingStarted) {
        console.error('❌ Failed to start video recording')
        // Continue anyway
      }

      // Get candidate info first
      let candidateName = 'there'
      try {
        const sessionInfo = await interviewService.getSession(sessionId)
        candidateName = sessionInfo.data.candidate_name || 'there'
        console.log('Candidate name:', candidateName)
      } catch (err) {
        console.error('Failed to get candidate name:', err)
      }

      // Determine speaker based on selected interviewer
      console.log('selectedInterviewer:', selectedInterviewer)
      const speaker = selectedInterviewer === 'aarushi' ? 'anushka' : 'abhilash'
      console.log('Computed speaker:', speaker)
      console.log('Sending speaker to backend:', speaker)

      // Start interview with speaker preference
      await interviewService.start(sessionId, speaker)

      // Safety delay to ensure DB transaction is committed
      await new Promise(resolve => setTimeout(resolve, 500))

      // 4. Get first question
      await getNextQuestion()
    } catch (err) {
      console.error('Failed to start interview:', err)
      setError('Failed to start interview. Please try again.')
    }
  }

  const getNextQuestion = async () => {
    try {
      setAvatarState('thinking')
      setStatus('Preparing next question...')
      setSubtitle('')

      const response = await interviewService.getNextQuestion(sessionId)
      const question = response.data

      // Check if interview is complete (question_id = 0 and is_last = true)
      if (question.is_last && question.question_id === 0) {
        console.log('Interview completed - showing completion message')

        // Show completion message
        setSubtitle(question.question_text)
        setAvatarState('speaking')
        setStatus('🎉 Interview Complete!')

        // Use Sarvam TTS for completion message with selected voice
        const speaker = selectedInterviewer === 'aarushi' ? 'anushka' : 'abhilash'
        try {
          console.log('Generating goodbye audio...')
          const audioResponse = await interviewService.generateGreetingAudio(question.question_text, speaker)
          const audioBlob = new Blob([audioResponse.data], { type: 'audio/wav' })
          const audioUrl = URL.createObjectURL(audioBlob)

          const audio = new Audio(audioUrl)
          console.log('Playing goodbye message...')
          audio.play().catch(e => console.log('Audio play error:', e))

          audio.onended = () => {
            console.log('Goodbye audio finished playing')
            setAvatarState('idle')
            URL.revokeObjectURL(audioUrl)
            // Wait 1 second after audio ends, then start finalization
            setTimeout(() => {
              handleInterviewComplete()
            }, 1000)
          }

          audio.onerror = () => {
            console.log('Audio error for completion message')
            setAvatarState('idle')
            // Still complete even if audio fails
            setTimeout(() => {
              handleInterviewComplete()
            }, 2000)
          }
        } catch (err) {
          console.log('TTS error for completion message:', err)
          setAvatarState('idle')
          // Still complete even if TTS fails
          setTimeout(() => {
            handleInterviewComplete()
          }, 2000)
        }
        return
      }

      setCurrentQuestion(question)
      setSubtitle(question.question_text)

      // Check if this is a coding question
      const isCodingQuestion = question.question_text.toLowerCase().includes('write') &&
        (question.question_text.toLowerCase().includes('code') ||
          question.question_text.toLowerCase().includes('function') ||
          question.question_text.toLowerCase().includes('program'))
      setShowCodeEditor(isCodingQuestion)

      // Play audio from backend (Sarvam TTS)
      if (question.audio_url) {
        console.log('🔊 Playing audio:', question.audio_url)
        setAvatarState('speaking')
        setStatus('Interviewer speaking...')

        // Construct full URL, handling trailing/leading slashes
        const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')
        const audioPath = question.audio_url.startsWith('/') ? question.audio_url : `/${question.audio_url}`
        const fullUrl = question.audio_url.startsWith('http')
          ? question.audio_url
          : `${baseUrl}${audioPath}`

        console.log('🔊 Full audio URL:', fullUrl)

        const audio = new Audio(fullUrl)

        audio.onloadeddata = () => {
          console.log('✅ Audio loaded successfully')
        }

        audio.play()
          .then(() => console.log('✅ Audio playing'))
          .catch(e => {
            console.error('❌ Audio play error:', e)
            setAvatarState('idle')
            setStatus('Your turn - listening...')
            // Auto-start recording on audio error
            startRecording()
          })

        audio.onended = () => {
          console.log('✅ Audio ended, auto-starting recording...')
          setAvatarState('listening')
          setStatus('Your turn - listening...')
          // Auto-start recording after interviewer finishes
          startRecording()
        }

        audio.onerror = (e) => {
          console.error('❌ Audio error:', e)
          setAvatarState('idle')
          setStatus('Your turn - listening...')
          // Auto-start recording on error
          startRecording()
        }
      } else {
        console.log('⚠️ No audio URL provided')
        setAvatarState('listening')
        setStatus('Your turn - listening...')
        // Auto-start recording when no audio
        startRecording()
      }
    } catch (err) {
      console.log('Error getting next question:', err)
      console.log('Error response:', err.response)

      // Check if it's a completion scenario
      if (err.response?.status === 200 ||
        err.response?.data?.detail === "Interview completed" ||
        err.response?.data?.is_interview_complete) {
        console.log('Interview completed via error handler')
        handleInterviewComplete()
      } else {
        console.error('Failed to get next question:', err)
        setError('Failed to get next question. The interview may be complete.')
        setAvatarState('idle')
        // Still try to complete gracefully
        setTimeout(() => {
          handleInterviewComplete()
        }, 3000)
      }
    }
  }

  const handleInterviewComplete = async () => {
    console.log('🏁 INTERVIEW COMPLETE - STARTING FINALIZATION')
    console.log('Session ID:', sessionId)
    console.log('Video recorder exists:', !!videoRecorderRef.current)
    console.log('Video stream exists:', !!videoStream)
    console.log('Is recording:', isVideoRecording)

    setInterviewComplete(true)
    setStatus('Finalizing interview...')

    // Stop and upload video
    console.log('Calling stopAndUploadVideo()...')
    const uploadSuccess = await stopAndUploadVideo()
    console.log('stopAndUploadVideo() returned:', uploadSuccess)

    if (uploadSuccess) {
      console.log('✅ Video saved successfully')
    } else {
      console.log('⚠️ Video save had issues')
    }

    // Stop video stream
    if (videoStream) {
      console.log('🎥 Stopping camera stream')
      videoStream.getTracks().forEach(track => track.stop())
      setVideoStream(null)
      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }

    setStatus('Interview Complete! Redirecting...')

    // Redirect after delay
    setTimeout(() => {
      console.log('🏠 Redirecting to home')
      navigate('/')
    }, 5000) // Increased to 5 seconds to see alerts
  }

  // Convert WebM audio to WAV format
  const convertToWav = async (webmBlob) => {
    try {
      console.log('🔄 Converting WebM to WAV...')
      console.log('Input blob size:', webmBlob.size, 'bytes')
      console.log('Input blob type:', webmBlob.type)

      // Create audio context
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      console.log('Audio context created, sample rate:', audioContext.sampleRate)

      // Read webm as array buffer
      const arrayBuffer = await webmBlob.arrayBuffer()
      console.log('Array buffer size:', arrayBuffer.byteLength, 'bytes')

      // Decode audio data
      console.log('Decoding audio data...')
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
      console.log('Audio decoded successfully!')
      console.log('Duration:', audioBuffer.duration, 'seconds')
      console.log('Channels:', audioBuffer.numberOfChannels)
      console.log('Sample rate:', audioBuffer.sampleRate)

      // Convert to WAV
      console.log('Converting to WAV format...')
      const wavBuffer = audioBufferToWav(audioBuffer)
      const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' })

      console.log('✅ Converted to WAV:', wavBlob.size, 'bytes')
      console.log('WAV blob type:', wavBlob.type)

      // Verify WAV header
      const headerCheck = new Uint8Array(wavBuffer.slice(0, 12))
      const riff = String.fromCharCode(...headerCheck.slice(0, 4))
      const wave = String.fromCharCode(...headerCheck.slice(8, 12))
      console.log('WAV header check - RIFF:', riff, 'WAVE:', wave)

      return wavBlob
    } catch (err) {
      console.error('❌ WAV conversion failed:', err)
      console.error('Error name:', err.name)
      console.error('Error message:', err.message)
      console.error('Stack:', err.stack)
      throw err // Don't return original, throw error so we know it failed
    }
  }

  // Helper: Convert AudioBuffer to WAV format
  const audioBufferToWav = (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels
    const sampleRate = audioBuffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16

    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample

    const data = []
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      data.push(audioBuffer.getChannelData(i))
    }

    const interleaved = interleave(data)
    const dataLength = interleaved.length * bytesPerSample
    const buffer = new ArrayBuffer(44 + dataLength)
    const view = new DataView(buffer)

    // WAV header
    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + dataLength, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(view, 36, 'data')
    view.setUint32(40, dataLength, true)

    // Write audio data
    floatTo16BitPCM(view, 44, interleaved)

    return buffer
  }

  const interleave = (channelData) => {
    const length = channelData[0].length
    const result = new Float32Array(length * channelData.length)
    let offset = 0
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < channelData.length; channel++) {
        result[offset++] = channelData[channel][i]
      }
    }
    return result
  }

  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  const floatTo16BitPCM = (view, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]))
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Try WAV format first, fallback to WebM
      let mimeType = 'audio/wav'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.log('⚠️ WAV not supported, using WebM')
        mimeType = 'audio/webm'
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus'
        }
      }

      console.log('🎤 Recording with:', mimeType)

      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType })
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        console.log(`🎤 Data available: ${event.data.size} bytes`)
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstart = () => {
        console.log('🎤 MediaRecorder started')
      }

      mediaRecorderRef.current.onerror = (event) => {
        console.error('🎤 MediaRecorder error:', event.error)
      }

      mediaRecorderRef.current.onstop = async () => {
        console.log('🎤 Recording stopped, processing audio...')

        // Create blob from chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        console.log(`📦 Audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`)

        // Only process if we have audio data
        if (audioBlob.size < 1000) {
          console.log('⚠️ Audio too short, skipping')
          setStatus('Recording too short, please try again')
          setAvatarState('idle')
          stream.getTracks().forEach(track => track.stop())
          return
        }

        try {
          let wavBlob = audioBlob

          // If not WAV, convert it
          if (!mimeType.includes('wav')) {
            console.log('🔄 Converting to WAV...')
            wavBlob = await convertToWav(audioBlob)
            console.log(`✅ Converted to WAV: ${wavBlob.size} bytes`)
          } else {
            console.log('✅ Already WAV format')
          }

          // Send WAV to backend
          await submitAnswer(wavBlob)
        } catch (err) {
          console.error('❌ Audio processing failed:', err)
          setError('Failed to process audio. Please try again.')
          setAvatarState('idle')
        } finally {
          stream.getTracks().forEach(track => track.stop())
        }
      }

      // Simple recording - no complex silence detection
      mediaRecorderRef.current.start(100) // Collect data every 100ms
      setIsRecording(true)
      setAvatarState('listening')
      setStatus('🎤 Listening... Click "Done" when finished')
      mediaStreamRef.current = stream

    } catch (err) {
      setError('Failed to start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const submitAnswer = async (audioBlob) => {
    try {
      setAvatarState('thinking')
      setStatus('Processing your response...')
      setSubtitle('')
      setShowCodeEditor(false)

      // Use NEW optimized conversation endpoint - single LLM call
      const response = await interviewService.submitConversation(sessionId, audioBlob)
      const result = response.data

      console.log('[Interview] Conversation response:', {
        quality: result.answer_quality,
        nextAction: result.next_action,
        question: `${result.question_number}/${result.total_questions}`
      })

      // Play interviewer's natural response
      if (result.spoken_response) {
        setSubtitle(result.spoken_response)
        setAvatarState('speaking')

        // Play audio if available (from Sarvam TTS)
        if (result.audio_base64) {
          try {
            const audioData = atob(result.audio_base64)
            const audioArray = new Uint8Array(audioData.length)
            for (let i = 0; i < audioData.length; i++) {
              audioArray[i] = audioData.charCodeAt(i)
            }
            const audioBlob = new Blob([audioArray], { type: 'audio/wav' })
            const audioUrl = URL.createObjectURL(audioBlob)

            audioRef.current.src = audioUrl
            audioRef.current.onended = async () => {
              URL.revokeObjectURL(audioUrl)
              await handleNextAction(result)
            }
            await audioRef.current.play()
          } catch (audioErr) {
            console.warn('[Interview] Audio playback failed, using browser TTS:', audioErr)
            await speakWithBrowserTTS(result.spoken_response)
            await handleNextAction(result)
          }
        } else {
          // Fallback to browser TTS
          await speakWithBrowserTTS(result.spoken_response)
          await handleNextAction(result)
        }
      } else {
        await handleNextAction(result)
      }
    } catch (err) {
      console.error('[Interview] Submit error:', err)
      // Fallback to legacy endpoint if conversation fails
      try {
        console.log('[Interview] Falling back to legacy /answers endpoint')
        const response = await interviewService.submitAnswer(sessionId, audioBlob)
        const evaluation = response.data

        if (evaluation.is_interview_complete) {
          handleInterviewComplete()
        } else {
          await getNextQuestion()
        }
      } catch (fallbackErr) {
        setError('Failed to submit answer. Please try again.')
        setAvatarState('idle')
        setStatus('Error - Please try again')
      }
    }
  }

  // Handle what happens after interviewer response
  const handleNextAction = async (result) => {
    if (result.is_interview_complete) {
      handleInterviewComplete()
    } else if (result.next_action === 'follow_up' && result.follow_up_question) {
      // Ask follow-up question directly (no need to fetch from server)
      setCurrentQuestion({ text: result.follow_up_question })
      await speakQuestion(result.follow_up_question)
    } else if (result.next_question_text) {
      // NEW: Use next question from conversation response (no extra API call!)
      console.log('[Interview] Using next question from conversation response')
      setCurrentQuestion({ text: result.next_question_text })
      setSubtitle(result.next_question_text)

      // Play the next question audio if available
      if (result.next_question_audio_base64) {
        try {
          const audioData = atob(result.next_question_audio_base64)
          const audioArray = new Uint8Array(audioData.length)
          for (let i = 0; i < audioData.length; i++) {
            audioArray[i] = audioData.charCodeAt(i)
          }
          const audioBlob = new Blob([audioArray], { type: 'audio/wav' })
          const audioUrl = URL.createObjectURL(audioBlob)

          audioRef.current.src = audioUrl
          audioRef.current.onended = () => {
            URL.revokeObjectURL(audioUrl)
            setAvatarState('listening')
            setStatus('Your turn to answer')
            // Auto-start recording after question finishes
            startRecording()
          }
          setAvatarState('speaking')
          setStatus('Speaking...')
          await audioRef.current.play()
        } catch (audioErr) {
          console.warn('[Interview] Next question audio failed, using browser TTS:', audioErr)
          await speakQuestion(result.next_question_text)
        }
      } else {
        await speakQuestion(result.next_question_text)
      }
    } else {
      // Fallback: Continue to next planned question (legacy flow)
      await getNextQuestion()
    }
  }

  // Browser TTS fallback
  const speakWithBrowserTTS = (text) => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.onend = resolve
        utterance.onerror = resolve
        speechSynthesis.speak(utterance)
      } else {
        // No TTS available, just wait briefly
        setTimeout(resolve, 1500)
      }
    })
  }

  // Speak a follow-up question using Sarvam TTS
  const speakQuestion = async (questionText) => {
    try {
      setSubtitle(questionText)
      setAvatarState('speaking')
      setStatus('Speaking...')

      // Use Sarvam TTS with selected voice
      const speaker = selectedInterviewer === 'aarushi' ? 'anushka' : 'abhilash'
      const audioResponse = await interviewService.generateGreetingAudio(questionText, speaker)
      const audioBlob = new Blob([audioResponse.data], { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)

      return new Promise((resolve) => {
        const audio = new Audio(audioUrl)
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          setAvatarState('listening')
          setStatus('Your turn to answer')
          // Auto-start recording after question finishes
          startRecording()
          resolve()
        }
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl)
          setAvatarState('listening')
          setStatus('Your turn to answer')
          startRecording()
          resolve()
        }
        audio.play().catch(() => {
          // Fallback to browser TTS
          speakWithBrowserTTS(questionText).then(resolve)
        })
      })
    } catch (err) {
      console.warn('[Interview] Sarvam TTS failed, using browser TTS:', err)
      await speakWithBrowserTTS(questionText)
      setAvatarState('listening')
      setStatus('Your turn to answer')
      startRecording()
    }
  }






  const handleCodeSubmit = async (code) => {
    try {
      setAvatarState('thinking')
      setStatus('Evaluating your code...')
      setSubtitle('')
      setShowCodeEditor(false)

      // Submit code as text answer
      const response = await interviewService.submitCodeAnswer(sessionId, code)
      const evaluation = response.data

      if (evaluation.is_interview_complete) {
        handleInterviewComplete()
      } else {
        await getNextQuestion()
      }
    } catch (err) {
      setError('Failed to submit code')
      setAvatarState('idle')
      setStatus('Error - Please try again')
    }
  }

  const handleEndInterview = () => {
    setShowEndConfirm(true)
  }

  const confirmEndInterview = async () => {
    setShowEndConfirm(false)
    setAvatarState('thinking')
    setStatus('Finalizing interview...')

    try {
      // End interview early via API
      await interviewService.endEarly(sessionId)
      handleInterviewComplete()
    } catch (err) {
      console.error('Error ending interview:', err)
      // Still complete on frontend
      handleInterviewComplete()
    }
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-mesh pointer-events-none" />
      <div className="fixed top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Recording Alert */}
      {showRecordingAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 glass rounded-full text-white font-semibold animate-pulse">
          {recordingStatus}
        </div>
      )}

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="glass rounded-3xl shadow-2xl max-w-6xl w-full p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl">
              {error}
            </div>
          )}

          {!interviewStarted ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-primary">
                <span className="text-4xl">🎤</span>
              </div>
              <h1 className="text-4xl font-bold mb-4 text-white">Welcome to Your Interview</h1>
              <p className="text-slate-400 mb-6 text-lg max-w-2xl mx-auto">
                You&apos;ll be interviewed by an AI interviewer. The interview will cover your skills and experience.
                Your video will be recorded for authenticity. Speak clearly and take your time with each answer.
              </p>

              {/* Interviewer Selection */}
              {showInterviewerSelection && !selectedInterviewer && (
                <div className="mb-8 max-w-2xl mx-auto">
                  <h2 className="text-2xl font-bold mb-4 text-white">Choose Your Interviewer</h2>
                  <p className="text-slate-400 mb-6">Who would you like to be interviewed by?</p>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Aarush - Male */}
                    <button
                      onClick={() => {
                        setSelectedInterviewer('aarush')
                        setShowInterviewerSelection(false)
                      }}
                      className="card group hover:border-primary cursor-pointer"
                    >
                      <div className="text-6xl mb-3">👨‍💼</div>
                      <h3 className="text-2xl font-bold text-primary-light mb-2">Aarush</h3>
                      <p className="text-slate-400 text-sm">Male Interviewer</p>
                      <div className="mt-3 text-xs text-slate-500">Professional & Friendly</div>
                    </button>

                    {/* Aarushi - Female */}
                    <button
                      onClick={() => {
                        setSelectedInterviewer('aarushi')
                        setShowInterviewerSelection(false)
                      }}
                      className="card group hover:border-secondary cursor-pointer"
                    >
                      <div className="text-6xl mb-3">👩‍💼</div>
                      <h3 className="text-2xl font-bold text-secondary-light mb-2">Aarushi</h3>
                      <p className="text-slate-400 text-sm">Female Interviewer</p>
                      <div className="mt-3 text-xs text-slate-500">Professional & Friendly</div>
                    </button>
                  </div>
                </div>
              )}

              {selectedInterviewer && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl max-w-md mx-auto">
                  <p className="text-green-400 font-semibold">
                    ✅ You&apos;ll be interviewed by {selectedInterviewer === 'aarush' ? 'Aarush 👨‍💼' : 'Aarushi 👩‍💼'}
                  </p>
                </div>
              )}

              {/* Video Preview */}
              <div className="mb-6 flex justify-center">
                <div className="relative bg-dark-card rounded-xl overflow-hidden shadow-lg border border-slate-700">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-64 h-48 object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full flex items-center space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span>Camera Active</span>
                  </div>
                  {!videoStream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-dark-card">
                      <div className="text-center text-white text-xs">
                        <div className="text-2xl mb-1">📹</div>
                        <p>Loading...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Permission Error Alert */}
              {permissionError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚠️</span>
                    <div>
                      <p className="font-bold text-red-400">Permission Required</p>
                      <p className="text-red-300 text-sm">{permissionError}</p>
                      <button
                        onClick={() => window.location.reload()}
                        className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                      >
                        Retry Permissions
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {selectedInterviewer && (
                <button
                  onClick={startInterview}
                  disabled={!permissionsGranted}
                  className={`px-10 py-4 rounded-xl font-bold text-xl shadow-lg transition-all ${permissionsGranted
                    ? 'btn-primary'
                    : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    }`}
                  title={!permissionsGranted ? 'Please allow camera and microphone access first' : ''}
                >
                  {permissionsGranted ? 'Start Interview' : '🔒 Waiting for Permissions'}
                </button>
              )}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left: Audio Visualizer */}
              <div>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white">
                    {selectedInterviewer === 'aarushi' ? 'Aarushi 👩‍💼' : 'Aarush 👨‍💼'}
                  </h2>
                  <p className="text-sm text-slate-400">Your AI Interviewer</p>
                </div>
                <AudioVisualizer
                  state={avatarState}
                  subtitle={subtitle}
                  speakerName={selectedInterviewer === 'aarushi' ? 'Aarushi' : 'Aarush'}
                  audioStream={videoStream}
                />
              </div>

              {/* Right: Candidate Video & Controls */}
              <div>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-white">You</h2>
                </div>

                {/* Candidate Video */}
                {!interviewComplete ? (
                  <div className="relative mb-6 bg-dark-card rounded-2xl overflow-hidden border border-slate-700" style={{ minHeight: '320px' }}>
                    <video
                      ref={interviewVideoRef}
                      autoPlay
                      playsInline
                      muted
                      key="interview-video"
                      className="w-full h-80 object-cover"
                      style={{ transform: 'scaleX(-1)', backgroundColor: '#0F172A' }}
                    />
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-red-500 text-white text-sm rounded-full flex items-center space-x-2 font-semibold">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>Recording</span>
                    </div>
                    {!videoStream && (
                      <div className="absolute inset-0 flex items-center justify-center bg-dark-card">
                        <div className="text-center text-white">
                          <div className="text-4xl mb-2">📹</div>
                          <p className="text-slate-400">Initializing camera...</p>
                        </div>
                      </div>
                    )}
                    {videoStream && (
                      <div className="absolute bottom-4 left-4 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                        Stream Active
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative mb-6 h-80 bg-green-500/10 rounded-2xl flex items-center justify-center border border-green-500/30">
                    <div className="text-center">
                      <div className="text-6xl mb-4">✅</div>
                      <p className="text-xl font-bold text-green-400">Recording Stopped</p>
                      <p className="text-sm text-green-300 mt-2">Camera and microphone turned off</p>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="mb-6 p-4 glass rounded-xl">
                  <p className="font-bold text-lg text-white">{status}</p>
                </div>

                {/* Code Editor for coding questions */}
                {showCodeEditor && !interviewComplete && (
                  <div className="mb-6">
                    <CodeEditor onSubmit={handleCodeSubmit} />
                  </div>
                )}

                {/* Controls - Minimal and Natural */}
                {!interviewComplete && (
                  <div className="space-y-3">
                    {isRecording ? (
                      // Recording state - show prominent Done button and audio animation
                      <div className="text-center py-6 bg-red-500/5 rounded-2xl border border-red-500/10 mb-4 scale-105 transition-all">
                        <div className="flex justify-center items-center space-x-1.5 h-12 mb-6">
                          {[...Array(8)].map((_, i) => (
                            <div
                              key={i}
                              className="w-2 bg-gradient-to-t from-red-500 to-pink-500 rounded-full animate-bounce"
                              style={{
                                height: `${16 + Math.random() * 24}px`,
                                animationDelay: `${i * 0.1}s`,
                                animationDuration: '0.6s'
                              }}
                            />
                          ))}
                        </div>
                        <button
                          onClick={stopRecording}
                          className="px-12 py-4 bg-red-600 text-white rounded-2xl font-bold text-xl hover:bg-red-700 shadow-glow-secondary transform hover:scale-105 transition-all flex items-center justify-center space-x-3 mx-auto"
                        >
                          <span className="text-2xl">⏹</span>
                          <span>I&apos;M DONE SPEAKING</span>
                        </button>
                        <p className="text-sm text-red-400 font-medium mt-4 animate-pulse">
                          ● Recording your answer...
                        </p>
                      </div>
                    ) : avatarState === 'speaking' ? (
                      // Interviewer speaking - just show status
                      <div className="text-center py-4">
                        <p className="text-slate-400">Listen carefully...</p>
                      </div>
                    ) : avatarState === 'thinking' ? (
                      // Processing - show loading
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
                        <p className="text-slate-400 mt-2">Processing...</p>
                      </div>
                    ) : (
                      // Idle/Listening state 
                      <div className="text-center py-2">
                        <p className="text-xs text-slate-500">Preparing...</p>
                      </div>
                    )}

                    {/* End interview - always available but very subtle */}
                    {!isRecording && avatarState !== 'thinking' && avatarState !== 'speaking' && (
                      <button
                        onClick={handleEndInterview}
                        className="w-full px-4 py-2 text-slate-600 hover:text-slate-400 text-xs font-medium transition-colors"
                      >
                        End Interview Early
                      </button>
                    )}
                  </div>
                )}

                {interviewComplete && (
                  <div className="p-6 bg-green-500/10 rounded-2xl border border-green-500/30">
                    <h3 className="text-2xl font-bold text-green-400 mb-3 flex items-center space-x-2">
                      <span>✅</span>
                      <span>Interview Completed!</span>
                    </h3>
                    <p className="text-slate-300 text-lg">
                      Thank you for your time. The HR team will review your interview and get back to you soon.
                    </p>
                  </div>
                )}

                {isRecording && (
                  <div className="mt-4 flex justify-center">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* End Interview Confirmation Modal */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">End Interview Early?</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to end the interview now? Your progress will be evaluated based on the questions answered so far.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={confirmEndInterview}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold"
              >
                Yes, End Now
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-colors font-semibold"
              >
                Continue Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InterviewRoom

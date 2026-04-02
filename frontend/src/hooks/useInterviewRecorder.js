import { useState, useRef, useCallback } from 'react'
import { interviewService } from '../api/services'
import { toast } from 'sonner'

export const useInterviewRecorder = (sessionId, videoStream) => {
  const [isVideoRecording, setIsVideoRecording] = useState(false)
  const [isAudioRecording, setIsAudioRecording] = useState(false)
  const videoRecorderRef = useRef(null)
  const audioRecorderRef = useRef(null)
  const videoChunksRef = useRef([])
  const audioChunksRef = useRef([])
  const recordedVideoBlob = useRef(null)

  // --- VIDEO RECORDING ---
  const startVideoRecording = useCallback(() => {
    if (!videoStream) return false

    try {
      let options = { videoBitsPerSecond: 250000, audioBitsPerSecond: 64000 }
      if (MediaRecorder.isTypeSupported('video/webm')) {
        options.mimeType = 'video/webm'
      }

      const recorder = new MediaRecorder(videoStream, options)
      videoChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          videoChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        if (videoChunksRef.current.length > 0) {
          recordedVideoBlob.current = new Blob(videoChunksRef.current, { type: 'video/webm' })
        }
      }

      recorder.start(1000)
      videoRecorderRef.current = recorder
      setIsVideoRecording(true)
      return true
    } catch (err) {
      console.error('Video recording failed:', err)
      return false
    }
  }, [videoStream])

  const stopAndUploadVideo = useCallback(async () => {
    if (!videoRecorderRef.current) return false

    if (videoRecorderRef.current.state !== 'inactive') {
      videoRecorderRef.current.stop()
      setIsVideoRecording(false)
    }

    // Wait for blob creation
    return new Promise((resolve) => {
      setTimeout(async () => {
        const blob = recordedVideoBlob.current || (videoChunksRef.current.length > 0 ? new Blob(videoChunksRef.current, { type: 'video/webm' }) : null)

        if (!blob || blob.size === 0) {
          resolve(false)
          return
        }

        try {
          const formData = new FormData()
          formData.append('video_file', blob, `interview_${sessionId}.webm`)
          await interviewService.uploadVideo(sessionId, formData)
          resolve(true)
        } catch (err) {
          console.error('Video upload failed:', err)
          resolve(false)
        }
      }, 1500)
    })
  }, [sessionId])

  // --- AUDIO RECORDING (PER QUESTION) ---
  const startAudioRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      let mimeType = 'audio/wav'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm;codecs=opus'
      }

      const recorder = new MediaRecorder(stream, { mimeType })
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.start(100)
      audioRecorderRef.current = recorder
      setIsAudioRecording(true)
      return stream
    } catch (err) {
      toast.error('Failed to start microphone.')
      throw err
    }
  }, [])

  const stopAudioRecording = useCallback(async (currentStream) => {
    return new Promise((resolve) => {
      if (!audioRecorderRef.current) {
        resolve(null)
        return
      }

      audioRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: audioRecorderRef.current.mimeType })
        if (currentStream) {
          currentStream.getTracks().forEach(track => track.stop())
        }

        if (audioBlob.size < 1000) {
          resolve(null)
          return
        }

        // Convert if needed
        let finalBlob = audioBlob
        if (!audioRecorderRef.current.mimeType.includes('wav')) {
          finalBlob = await convertToWav(audioBlob)
        }
        resolve(finalBlob)
      }

      audioRecorderRef.current.stop()
      setIsAudioRecording(false)
    })
  }, [])

  const convertToWav = async (webmBlob) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const arrayBuffer = await webmBlob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Simplification: call original converter (I'll need to move helper too)
    return new Blob([audioBufferToWav(audioBuffer)], { type: 'audio/wav' })
  }

  // --- HELPER CONVERTER ---
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

    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i))
    }

    const floatTo16BitPCM = (view, offset, input) => {
      for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]))
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
      }
    }

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

  return {
    isVideoRecording,
    isAudioRecording,
    startVideoRecording,
    stopAndUploadVideo,
    startAudioRecording,
    stopAudioRecording
  }
}

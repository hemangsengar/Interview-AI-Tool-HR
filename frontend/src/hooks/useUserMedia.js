import { useState, useCallback, useEffect } from 'react'

export const useUserMedia = () => {
  const [stream, setStream] = useState(null)
  const [error, setError] = useState(null)
  const [isReady, setIsReady] = useState(false)

  const requestPermissions = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user'
        }
      })
      setStream(mediaStream)
      setIsReady(true)
      setError(null)
      return mediaStream
    } catch (err) {
      console.error('Media permission error:', err)
      let errorMessage = 'Failed to access camera/microphone.'
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera and microphone access denied. Please allow permissions to continue.'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No camera or microphone found. Please connect devices to continue.'
      }
      
      setError(errorMessage)
      setIsReady(false)
      throw err
    }
  }, [])

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
      setIsReady(false)
    }
  }, [stream])

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return {
    stream,
    error,
    isReady,
    requestPermissions,
    stopStream
  }
}

import { useState, useCallback, useRef } from 'react'
import { interviewService } from '../api/services'
import { toast } from 'sonner'

export const useInterviewSession = (sessionId) => {
  const [avatarState, setAvatarState] = useState('idle')
  const [subtitle, setSubtitle] = useState('')
  const [status, setStatus] = useState('Not Started')
  const [interviewStarted, setInterviewStarted] = useState(false)
  const [interviewComplete, setInterviewComplete] = useState(false)
  const [showCodeEditor, setShowCodeEditor] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  
  const audioRef = useRef(new Audio())

  const getNextQuestion = useCallback(async (onQuestionReceived) => {
    try {
      setAvatarState('thinking')
      setStatus('Preparing next question...')
      setSubtitle('')

      const response = await interviewService.getNextQuestion(sessionId)
      const question = response.data
      setCurrentQuestion(question)

      if (question.is_last && question.question_id === 0) {
        setSubtitle(question.question_text)
        setAvatarState('speaking')
        setStatus('🎉 Interview Complete!')
        return { complete: true, text: question.question_text }
      }

      setSubtitle(question.question_text)
      const isCoding = question.question_text.toLowerCase().includes('write') &&
        (question.question_text.toLowerCase().includes('code') ||
          question.question_text.toLowerCase().includes('function') ||
          question.question_text.toLowerCase().includes('program'))
      setShowCodeEditor(isCoding)

      if (onQuestionReceived) onQuestionReceived(question)
      return { complete: false, question }
    } catch (err) {
      console.error('Failed to get next question:', err)
      return { error: true }
    }
  }, [sessionId])

  const submitAnswer = useCallback(async (audioBlob) => {
    try {
      setAvatarState('thinking')
      setStatus('Processing your response...')
      setSubtitle('')
      setShowCodeEditor(false)

      const response = await interviewService.submitConversation(sessionId, audioBlob)
      return response.data
    } catch (err) {
      toast.error('Failed to submit answer.')
      throw err
    }
  }, [sessionId])

  const startInterview = useCallback(async (selectedInterviewer) => {
    try {
      setStatus('Starting interview...')
      setInterviewStarted(true)
      const speaker = selectedInterviewer === 'aarushi' ? 'anushka' : 'abhilash'
      await interviewService.start(sessionId, speaker)
      return { success: true }
    } catch (err) {
      toast.error('Failed to start interview.')
      throw err
    }
  }, [sessionId])

  return {
    avatarState,
    setAvatarState,
    subtitle,
    setSubtitle,
    status,
    setStatus,
    interviewStarted,
    setInterviewStarted,
    interviewComplete,
    setInterviewComplete,
    showCodeEditor,
    setShowCodeEditor,
    currentQuestion,
    getNextQuestion,
    submitAnswer,
    startInterview,
    audioRef
  }
}

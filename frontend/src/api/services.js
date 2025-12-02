import apiClient from './client'

// Auth Services
export const authService = {
  signup: (data) => apiClient.post('/api/auth/signup', data),
  login: (data) => apiClient.post('/api/auth/login', data)
}

// Job Services
export const jobService = {
  create: (data) => apiClient.post('/api/jobs', data),
  list: () => apiClient.get('/api/jobs'),
  get: (jobId) => apiClient.get(`/api/jobs/${jobId}`),
  update: (jobId, formData) => 
    apiClient.put(`/api/jobs/${jobId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  delete: (jobId) => apiClient.delete(`/api/jobs/${jobId}`),
  getByCode: (jobCode) => apiClient.get(`/api/jobs/by-code/${jobCode}`),
  getCandidates: (jobId) => apiClient.get(`/api/jobs/${jobId}/candidates`),
  registerCandidate: (jobId, formData) => 
    apiClient.post(`/api/jobs/${jobId}/candidates`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteCandidate: (candidateId) => apiClient.delete(`/api/jobs/candidates/${candidateId}`),
  downloadResume: (candidateId) => apiClient.get(`/api/jobs/candidates/${candidateId}/resume`, {
    responseType: 'blob'
  })
}

// Interview Services
export const interviewService = {
  start: (sessionId, speaker = 'abhilash') => {
    console.log('[API] start() called with speaker:', speaker)
    return apiClient.post(`/api/interviews/${sessionId}/start`, { speaker })
  },
  getNextQuestion: (sessionId) => apiClient.post(`/api/interviews/${sessionId}/next-question`),
  submitAnswer: (sessionId, audioBlob) => {
    const formData = new FormData()
    formData.append('audio_file', audioBlob, 'answer.wav')
    return apiClient.post(`/api/interviews/${sessionId}/answers`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },
  submitCodeAnswer: (sessionId, code) => {
    return apiClient.post(`/api/interviews/${sessionId}/code-answer`, {
      code_text: code
    })
  },
  generateGreetingAudio: (text, speaker = 'abhilash') => {
    console.log('[API] generateGreetingAudio() called with speaker:', speaker)
    return apiClient.post('/api/interviews/tts', { text, speaker }, {
      responseType: 'arraybuffer'
    })
  },
  uploadVideo: (sessionId, formData) => 
    apiClient.post(`/api/interviews/${sessionId}/upload-video`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  downloadVideo: (sessionId) => 
    apiClient.get(`/api/interviews/${sessionId}/video/download`, {
      responseType: 'blob'
    }),
  endEarly: (sessionId) => apiClient.post(`/api/interviews/${sessionId}/end`),
  getResults: (sessionId) => apiClient.get(`/api/interviews/${sessionId}/results`),
  getSession: (sessionId) => apiClient.get(`/api/interviews/${sessionId}`),
  transcribeAudio: (formData) => 
    apiClient.post('/api/interviews/transcribe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  submitTextAnswer: (sessionId, transcriptText) => 
    apiClient.post(`/api/interviews/${sessionId}/text-answer`, {
      transcript: transcriptText
    })
}

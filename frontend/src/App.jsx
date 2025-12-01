import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Pages
import Landing from './pages/Landing'
import HRLogin from './pages/HRLogin'
import HRSignup from './pages/HRSignup'
import HRDashboard from './pages/HRDashboard'
import JobDetails from './pages/JobDetails'
import InterviewResults from './pages/InterviewResults'
import CandidateEntry from './pages/CandidateEntry'
import CandidateApply from './pages/CandidateApply'
import InterviewRoom from './pages/InterviewRoom'

function ProtectedRoute({ children }) {
  const token = useAuthStore(state => state.token)
  return token ? children : <Navigate to="/hr/login" />
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/hr/login" element={<HRLogin />} />
        <Route path="/hr/signup" element={<HRSignup />} />
        <Route path="/candidate" element={<CandidateEntry />} />
        <Route path="/apply/:jobId" element={<CandidateApply />} />
        <Route path="/interview/:sessionId" element={<InterviewRoom />} />
        
        {/* Protected HR Routes */}
        <Route path="/hr/jobs" element={
          <ProtectedRoute>
            <HRDashboard />
          </ProtectedRoute>
        } />
        <Route path="/hr/jobs/:jobId" element={
          <ProtectedRoute>
            <JobDetails />
          </ProtectedRoute>
        } />
        <Route path="/hr/interviews/:sessionId" element={
          <ProtectedRoute>
            <InterviewResults />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  )
}

export default App

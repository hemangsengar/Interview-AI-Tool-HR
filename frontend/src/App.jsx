import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import MainLayout from './components/layout/MainLayout'
import Landing from './pages/Landing'
import HRLogin from './pages/HRLogin'
import HRSignup from './pages/HRSignup'
import HRDashboard from './pages/HRDashboard'
import JobDetails from './pages/JobDetails'
import CandidateEntry from './pages/CandidateEntry'
import CandidateApply from './pages/CandidateApply'
import InterviewRoom from './pages/InterviewRoom'
import InterviewResults from './pages/InterviewResults'
import HRSettings from './pages/HRSettings'
import InterviewSuccess from './pages/InterviewSuccess'
import NotFound from './pages/NotFound'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/hr/login" replace />
  return <MainLayout>{children}</MainLayout>
}

const PublicLayout = ({ children }) => {
  return <div className="min-h-screen bg-dark">{children}</div>
}

function App() {
  return (
    <>
      <Toaster position="top-right" theme="dark" richColors closeButton />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/hr/login" element={<PublicLayout><HRLogin /></PublicLayout>} />
        <Route path="/hr/signup" element={<PublicLayout><HRSignup /></PublicLayout>} />
        
        {/* Candidate Routes */}
        <Route path="/candidate" element={<PublicLayout><CandidateEntry /></PublicLayout>} />
        <Route path="/candidate/apply/:jobId" element={<PublicLayout><CandidateApply /></PublicLayout>} />
        <Route path="/interview/:sessionId" element={<PublicLayout><InterviewRoom /></PublicLayout>} />
        <Route path="/interview/success/:sessionId" element={<PublicLayout><InterviewSuccess /></PublicLayout>} />
        
        {/* HR Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><HRDashboard /></ProtectedRoute>} />
        <Route path="/job/:jobId" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
        <Route path="/results/:sessionId" element={<ProtectedRoute><InterviewResults /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><HRSettings /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </>
  )
}

export default App

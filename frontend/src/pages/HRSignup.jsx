import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../api/services'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { toast } from 'sonner'
import { UserPlus, ArrowLeft, UserCircle } from 'lucide-react'

const HRSignup = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore(state => state.setAuth)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await authService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      setAuth(response.data.access_token, response.data.user)
      toast.success('Account created successfully!', {
        description: 'Welcome to InterviewAI'
      })
      navigate('/dashboard')
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Signup failed. Please try again.'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden flex items-center justify-center p-6">
      {/* Animated mesh background */}
      <div className="absolute inset-0 bg-gradient-mesh" />

      {/* Floating orbs */}
      <div className="absolute top-10 right-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Signup Card */}
      <div className="relative w-full max-w-md animate-reveal-up">
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-secondary rounded-3xl blur-lg opacity-30" />

        <Card className="border-white/10 hover:border-secondary/20 transition-all duration-500">
          <CardContent className="pt-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block mb-6">
                <div className="w-16 h-16 bg-gradient-secondary rounded-2xl flex items-center justify-center mx-auto shadow-glow-secondary hover:scale-110 transition-transform">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
              </Link>
              <h1 className="text-3xl font-display font-bold text-white mb-2">Create Account</h1>
              <p className="text-slate-400">Start conducting AI-powered interviews</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Confirm
                  </label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                variant="secondary"
                size="xl"
                className="w-full mt-4 bg-gradient-secondary border-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Create Account
                  </span>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center pt-6 border-t border-white/5">
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <Link to="/hr/login" className="text-secondary-light hover:text-white transition-colors font-semibold">
                  Sign in
                </Link>
              </p>
            </div>

            {/* Back to home */}
            <div className="mt-6 text-center">
              <Link to="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default HRSignup

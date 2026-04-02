import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authService } from '../api/services'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import { toast } from 'sonner'
import { LogIn, ArrowLeft, Building2 } from 'lucide-react'

const HRLogin = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore(state => state.setAuth)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await authService.login(formData)
      setAuth(response.data.access_token, response.data.user)
      toast.success('Welcome back!')
      navigate('/hr/jobs')
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Login failed. Please try again.'
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
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Login Card */}
      <div className="relative w-full max-w-md animate-reveal-up">
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-primary rounded-3xl blur-lg opacity-30" />

        <Card className="border-white/10">
          <CardContent className="pt-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-glow-primary hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              </Link>
              <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h1>
              <p className="text-slate-400">Sign in to access your HR dashboard</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
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

              <Button
                type="submit"
                disabled={loading}
                variant="premium"
                size="xl"
                className="w-full mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </span>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center pt-6 border-t border-white/5">
              <p className="text-slate-400 text-sm">
                Don&apos;t have an account?{' '}
                <Link to="/hr/signup" className="text-primary-light hover:text-white transition-colors font-semibold">
                  Create one
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

export default HRLogin

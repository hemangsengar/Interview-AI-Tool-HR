import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Home, RefreshCw, AlertCircle } from 'lucide-react'

const ErrorPage = ({ message, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      
      <div className="relative z-10 animate-reveal-up">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-primary/5">
          <AlertCircle className="w-12 h-12 text-primary" />
        </div>
        
        <h1 className="text-4xl font-display font-bold text-white mb-4">Something went wrong</h1>
        <p className="text-slate-400 max-w-md mx-auto mb-10 leading-relaxed text-sm">
          {message || 'An unexpected error occurred. Our team has been notified and we are working to fix it.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {resetErrorBoundary && (
            <Button 
              onClick={resetErrorBoundary}
              variant="premium" 
              size="lg" 
              className="px-10 h-14"
            >
              <RefreshCw className="mr-3 w-5 h-5" />
              Try Again
            </Button>
          )}
          <Link to="/">
            <Button 
              variant="outline" 
              size="lg" 
              className="px-10 h-14 border-white/10 hover:bg-white/5 backdrop-blur-md"
            >
              <Home className="mr-3 w-5 h-5" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage

import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Home, AlertTriangle } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-gradient-mesh opacity-30" />
      
      <div className="relative z-10 animate-reveal-up">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-red-500/5">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        
        <h1 className="text-8xl font-display font-black text-white mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-300 mb-6">Page Not Found</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        <Link to="/">
          <Button variant="premium" size="xl" className="px-10 h-16">
            <Home className="mr-3 w-6 h-6" />
            Back to Safety
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFound

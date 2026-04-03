import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Mic,
  Settings, 
  LogOut, 
  ArrowRight
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { cn } from '../../lib/utils'

const Sidebar = () => {
  const location = useLocation()
  const logout = useAuthStore(state => state.logout)

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ]

  return (
    <aside className="w-64 border-r border-stone-200/60 bg-white/80 backdrop-blur-xl h-screen sticky top-0 flex flex-col shadow-sm">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-display text-lg leading-tight text-stone-900 font-bold">InterviewAI</p>
            <p className="text-[10px] text-primary uppercase tracking-widest font-bold">HR Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-bold",
              location.pathname === item.path 
                ? "bg-orange-50 text-primary border border-orange-100/50 shadow-sm" 
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              location.pathname === item.path ? "text-primary" : "text-stone-400 group-hover:text-primary"
            )} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-stone-100 space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors group text-sm font-bold"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
        
        <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100/50 mt-4">
          <p className="text-xs text-stone-500 mb-3 leading-relaxed">Found a bug or need help with AI screening?</p>
          <a 
            href="mailto:support@interviewai.com" 
            className="text-xs font-bold text-primary hover:underline flex items-center gap-2"
          >
            Contact Support
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

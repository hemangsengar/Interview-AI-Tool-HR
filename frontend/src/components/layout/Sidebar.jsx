import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Briefcase, 
  Settings, 
  Users, 
  LogOut, 
  PlusCircle 
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
    <aside className="w-64 border-r border-white/5 bg-dark-card/50 backdrop-blur-xl h-screen sticky top-0 flex flex-col">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow-primary group-hover:scale-110 transition-transform">
            <span className="text-white font-bold text-xl">AI</span>
          </div>
          <div>
            <p className="font-display text-lg leading-tight">InterviewAI</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">HR Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              location.pathname === item.path 
                ? "bg-primary/10 text-primary-light border border-primary/20" 
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn(
              "w-5 h-5 transition-colors",
              location.pathname === item.path ? "text-primary-light" : "group-hover:text-primary-light"
            )} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors group"
        >
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
        
        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 mt-4">
          <p className="text-xs text-slate-400 mb-3">Found a bug or need help?</p>
          <a 
            href="mailto:support@interviewai.com" 
            className="text-xs font-semibold text-primary-light hover:underline"
          >
            Contact Support
          </a>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

import Sidebar from './Sidebar'
import { Bell, Search, User } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'

const MainLayout = ({ children, showSidebar = true }) => {
  const user = useAuthStore(state => state.user)

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-60 pointer-events-none z-0" />
      <div className="fixed top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[30rem] h-[30rem] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {showSidebar && <Sidebar />}

      <main className="flex-1 overflow-y-auto relative z-10 flex flex-col h-screen">
        {showSidebar && (
          <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-stone-200/60 px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search candidates, jobs, or results..." 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all text-stone-900 placeholder:text-stone-400 shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="p-2.5 rounded-xl hover:bg-stone-50 text-stone-400 hover:text-stone-900 transition-all relative group border border-stone-200 bg-white shadow-sm">
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white" />
              </button>
              
              <div className="h-8 w-px bg-stone-200 mx-2" />
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-stone-900 leading-none mb-1">{user?.name || 'Recruiter'}</p>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{user?.role || 'Hiring Manager'}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-primary p-0.5 shadow-md">
                  <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-primary" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        <div className={cn(
          "w-full mx-auto",
          showSidebar ? "p-8 lg:p-12" : "max-w-4xl pt-20 px-6"
        )}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default MainLayout

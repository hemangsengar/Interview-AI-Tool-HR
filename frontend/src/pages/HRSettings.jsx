import { useState } from 'react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { toast } from 'sonner'
import { 
  User, 
  Key, 
  Bell, 
  Shield, 
  Save, 
  ExternalLink,
  ChevronRight,
  Globe,
  Mail
} from 'lucide-react'
import { cn } from '../lib/utils'

const HRSettings = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)

  const [profile, setProfile] = useState({
    name: 'Hemang Singh Sengar',
    email: 'hemang@example.com',
    role: 'Senior recruiter',
    company: 'GenAI Technologies'
  })

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success('Settings saved successfully!')
    }, 1500)
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ]

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-reveal-up">
      <div className="mb-10">
        <h1 className="text-4xl font-display font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account preferences and API integrations</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Sidebar Nav */}
        <div className="w-full lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium",
                activeTab === tab.id 
                  ? "bg-primary/20 text-primary-light border border-primary/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </div>
              <ChevronRight className={cn("w-4 h-4 transition-transform", activeTab === tab.id ? "rotate-90" : "")} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Card className="border-white/5 bg-white/5 backdrop-blur-sm">
            <CardContent className="p-8">
              {activeTab === 'profile' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-primary flex items-center justify-center text-3xl shadow-glow-primary">
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Your Avatar</h3>
                      <p className="text-sm text-slate-400 mb-4">Click to upload a custom profile picture</p>
                      <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
                        Change Photo
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                      <Input 
                        value={profile.name} 
                        onChange={(e) => setProfile({...profile, name: e.target.value})}
                        icon={User}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Email Address</label>
                      <Input 
                        value={profile.email} 
                        disabled
                        icon={Mail}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Company</label>
                      <Input 
                        value={profile.company} 
                        onChange={(e) => setProfile({...profile, company: e.target.value})}
                        icon={Globe}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Role</label>
                      <Input 
                        value={profile.role} 
                        onChange={(e) => setProfile({...profile, role: e.target.value})}
                        icon={Shield}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'api' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">API Integrations</h3>
                    <p className="text-slate-400 text-sm">Connect your applicant tracking systems or custom integrations.</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/20 text-primary-light">
                          <Key className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white font-bold">Standard API Key</p>
                          <p className="text-xs text-slate-500">Last used: 2 hours ago</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-white/10 hover:bg-white/5">
                        Reveal Key
                      </Button>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 font-mono text-xs text-slate-400 border border-white/5 flex items-center justify-between">
                      sk_live_51P2...MjR7
                      <ExternalLink className="w-4 h-4 cursor-pointer hover:text-primary-light" />
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5">
                    <p className="text-sm text-primary-light font-bold mb-1">Developer Documentation</p>
                    <p className="text-xs text-slate-400 mb-4">Learn how to automate candidate invites and fetch results via our REST API.</p>
                    <Button variant="premium" size="sm">
                      Read API Docs
                    </Button>
                  </div>
                </div>
              )}

              {/* Placeholder for other tabs */}
              {['notifications', 'security'].includes(activeTab) && (
                <div className="py-20 text-center animate-in fade-in duration-300">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <tab.icon className="w-8 h-8 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{tabs.find(t => t.id === activeTab).label} Settings</h3>
                  <p className="text-slate-500">Additional options will be available in the next version.</p>
                </div>
              )}

              <div className="mt-12 pt-8 border-t border-white/5 flex justify-end">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  variant="premium"
                  size="lg"
                  className="px-10 h-14"
                >
                  {isSaving ? "Saving..." : (
                    <>
                      <Save className="mr-3 w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default HRSettings

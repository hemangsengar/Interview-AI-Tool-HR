import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { 
  Mic, 
  Users, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  Play,
  Github,
  Linkedin,
  Cpu,
  MessagesSquare,
  Trophy
} from 'lucide-react'

// Warm up the backend on landing page load (handles Render cold start)
const warmUpBackend = async () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  try {
    await fetch(`${apiUrl}/health`, { mode: 'cors' })
    console.log('[WARMUP] Backend is ready!')
  } catch (e) {
    console.log('[WARMUP] Backend warming up...')
  }
}

const Landing = () => {
  useEffect(() => {
    warmUpBackend()
  }, [])

  const keyStats = [
    { value: '3x', label: 'Faster Screening', icon: Zap },
    { value: '24/7', label: 'Availability', icon: Globe },
    { value: '100%', label: 'Standardized', icon: ShieldCheck }
  ]

  const featureHighlights = [
    {
      title: 'Adaptive AI Interview Flow',
      description: 'Questions evolve in real-time based on candidate depth and reasoning.',
      icon: Cpu,
      color: 'text-primary-light',
      bg: 'bg-primary/10'
    },
    {
      title: 'Voice Intelligence',
      description: 'Analyze communication patterns, technical clarity, and confidence metrics.',
      icon: Mic,
      color: 'text-secondary-light',
      bg: 'bg-secondary/10'
    },
    {
      title: 'Recruiter Insights',
      description: 'Detailed score distribution and recommendation confidence for every candidate.',
      icon: BarChart3,
      color: 'text-accent-light',
      bg: 'bg-accent/10'
    }
  ]

  const processSteps = [
    {
      title: 'Configure Role',
      detail: 'Set job requirements and focus areas in seconds.',
      icon: Users
    },
    {
      title: 'Global Invites',
      detail: 'Share links and let candidates interview at their convenience.',
      icon: MessagesSquare
    },
    {
      title: 'Decision Intelligence',
      detail: 'Review AI-powered summaries and hire with confidence.',
      icon: Trophy
    }
  ]

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden text-white font-sans">
      {/* Background Orbs */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-float opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] animate-float opacity-50" style={{ animationDelay: '2s' }} />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b border-white/5 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow-primary group-hover:rotate-12 transition-transform duration-500">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold tracking-tight">InterviewAI</p>
              <p className="text-[10px] text-primary-light font-bold uppercase tracking-widest opacity-80">Next-Gen Hiring</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-slate-400">
            <a href="#features" className="hover:text-primary-light transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary-light transition-colors">Solution</a>
            <Link to="/hr/login" className="hover:text-primary-light transition-colors">HR Dashboard</Link>
          </div>

          <Link to="/hr/login">
            <Button variant="outline" size="lg" className="border-white/10 hover:border-primary/50 backdrop-blur-md">
              Sign In
            </Button>
          </Link>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="animate-reveal-up">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-primary-light text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                V2.0 Now Live • AI Powered Interviews
              </div>

              <h1 className="font-display text-5xl sm:text-7xl leading-[1.1] font-extrabold mb-8">
                The Future of <br />
                <span className="text-gradient">Technical Hiring</span>
              </h1>

              <p className="text-slate-400 text-xl leading-relaxed max-w-xl mb-12">
                Conduct high-fidelity technical interviews at scale. Our AI platform 
                mimics your best interviewers, reducing TTR by 70% while improving candidate experience.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 mb-16">
                <Link to="/hr/login">
                  <Button variant="premium" size="xl" className="px-10 h-16 text-lg">
                    Build Your Team
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                </Link>
                <Link to="/candidate">
                  <Button variant="outline" size="xl" className="px-10 h-16 text-lg border-white/10 hover:bg-white/5 backdrop-blur-sm">
                    Enter Job Code
                    <Play className="ml-3 w-5 h-5 fill-current" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {keyStats.map((stat) => (
                  <div key={stat.label} className="p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm group hover:border-primary/30 transition-all duration-500">
                    <stat.icon className="w-5 h-5 text-primary-light mb-3" />
                    <p className="font-display text-3xl font-bold text-white mb-1 group-hover:scale-110 origin-left transition-transform">{stat.value}</p>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Preview Component */}
            <div className="relative animate-reveal-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-[80px] -z-10 animate-pulse" />
              <Card className="border-white/10 bg-[#0c0c0e]/80 backdrop-blur-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest ml-4 font-bold">Interview Analysis Session</span>
                </div>
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-secondary flex items-center justify-center text-2xl shadow-glow-secondary">👩‍💼</div>
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">Ms. Aarushi</h3>
                      <p className="text-xs text-secondary-light font-bold uppercase tracking-widest">AI Interviewer • Active</p>
                    </div>
                  </div>

                  <div className="space-y-6 mb-10">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 relative">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Question</p>
                      <p className="text-sm text-slate-200 italic leading-relaxed">
                        "Explain the CAP theorem and how it influences your choice of database for a global financial ledger."
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 relative ml-8">
                      <p className="text-[10px] text-primary-light font-bold uppercase mb-2">Confidence Score: 94%</p>
                      <p className="text-sm text-white leading-relaxed">
                        The candidate explains that consistency is non-negotiable for a ledger, choosing CP systems like Spanner or RDBMS over AP systems.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {['Technical', 'Soft Skills', 'Clarity'].map((metric, i) => (
                      <div key={metric} className="text-center">
                        <div className="h-1 bg-white/5 rounded-full mb-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-primary rounded-full transition-all duration-1000" 
                            style={{ width: `${80 + i * 5}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{metric}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-sm font-bold text-primary-light uppercase tracking-[0.3em] mb-6">Cutting-Edge Features</h2>
            <h3 className="text-4xl sm:text-5xl font-display font-bold text-white mb-6">Designed for Enterprise Scale</h3>
            <p className="text-slate-400 text-lg">Every tool you need to build a high-performance engineering culture, powered by advanced LLMs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featureHighlights.map((feature, index) => (
              <Card key={feature.title} className="bg-white/5 border-white/5 hover:border-primary/30 transition-all duration-500 group">
                <CardContent className="p-10">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", feature.bg, feature.color)}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-4">{feature.title}</h4>
                  <p className="text-slate-400 leading-relaxed text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-32 border-t border-white/5 relative">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold text-secondary-light uppercase tracking-[0.3em] mb-6">The Workflow</h2>
            <h3 className="text-4xl sm:text-5xl font-display font-bold text-white">Three Steps to Better Hires</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-[60px] inset-x-20 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            
            {processSteps.map((step, index) => (
              <div key={step.title} className="text-center relative z-10">
                <div className="w-16 h-16 bg-[#0c0c0e] border border-white/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl ring-4 ring-white/5">
                  <step.icon className="w-6 h-6 text-primary-light" />
                </div>
                <h4 className="text-xl font-bold text-white mb-4">0{index + 1}. {step.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[250px] mx-auto">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Creator Section */}
        <section id="creator" className="max-w-4xl mx-auto px-6 py-32">
          <Card className="border-primary/20 bg-primary/5 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
              <MessagesSquare className="w-48 h-48" />
            </div>
            <CardContent className="p-12 relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-sm font-bold text-primary-light uppercase tracking-widest mb-4">The Architect</h3>
                  <h4 className="text-4xl font-display font-bold text-white mb-6">Hemang Singh Sengar</h4>
                  <p className="text-slate-300 leading-relaxed mb-10 text-lg">
                    A Gen-AI engineer focused on building practical, scalable AI solutions for human-centric problems.
                    InterviewAI is a manifestation of data-driven hiring.
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <a href="https://github.com/hemangsengar" target="_blank" rel="noreferrer">
                      <Button variant="outline" className="border-white/10 bg-black/20 hover:bg-black/40 h-14 px-8">
                        <Github className="mr-3 w-5 h-5 text-slate-400" />
                        GitHub
                      </Button>
                    </a>
                    <a href="https://linkedin.com/in/hemangsengar" target="_blank" rel="noreferrer">
                      <Button variant="outline" className="border-white/10 bg-black/20 hover:bg-black/40 h-14 px-8">
                        <Linkedin className="mr-3 w-5 h-5 text-blue-400" />
                        LinkedIn
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Final CTA */}
        <section className="max-w-7xl mx-auto px-6 py-32">
           <div className="bg-gradient-to-r from-primary/20 to-secondary/20 rounded-[40px] p-16 sm:p-24 text-center border border-white/5 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
             <h3 className="text-4xl sm:text-6xl font-display font-bold text-white mb-10 relative z-10">Ready to transform <br/> your hiring process?</h3>
             <Link to="/hr/login" className="relative z-10">
               <Button variant="premium" size="xl" className="px-16 h-20 text-2xl shadow-glow-primary hover:scale-105 transition-transform">
                 Get Started For Free
                 <ArrowRight className="ml-4 w-8 h-8" />
               </Button>
             </Link>
             <p className="mt-8 text-slate-500 font-bold uppercase tracking-widest text-sm relative z-10 animate-pulse">Join 500+ tech teams scaling with AI</p>
           </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 pb-20 pt-10 border-t border-white/5 text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
               <Mic className="w-4 h-4 text-slate-400" />
             </div>
             <p className="font-bold text-white">InterviewAI</p>
          </div>
          
          <div className="flex gap-10 text-xs font-bold uppercase tracking-widest">
            <a href="https://github.com/hemangsengar/Interview-AI-Tool-HR" target="_blank" rel="noreferrer" className="hover:text-primary-light transition-colors">Source Code</a>
            <p>© 2026 Crafted by Hemang</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Landing

import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { cn } from '../lib/utils'
import { 
  Mic, 
  Users, 
  BarChart3, 
  Zap, 
  ShieldCheck, 
  Globe, 
  ArrowRight, 
  Play,
  Cpu,
  MessagesSquare,
  Trophy
} from 'lucide-react'

const Landing = () => {
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
      color: 'text-primary',
      bg: 'bg-primary/5'
    },
    {
      title: 'Voice Intelligence',
      description: 'Analyze communication patterns, technical clarity, and confidence metrics.',
      icon: Mic,
      color: 'text-secondary',
      bg: 'bg-secondary/5'
    },
    {
      title: 'Recruiter Insights',
      description: 'Detailed score distribution and recommendation confidence for every candidate.',
      icon: BarChart3,
      color: 'text-accent',
      bg: 'bg-accent/5'
    }
  ]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden text-foreground font-sans">
      {/* Background Orbs */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-60" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-float opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-float opacity-50" style={{ animationDelay: '2s' }} />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between border-b border-stone-200/60 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold tracking-tight text-stone-900">InterviewAI</p>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest opacity-80">Next-Gen Hiring</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-10 text-sm font-bold uppercase tracking-widest text-stone-500">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <Link to="/hr/login" className="hover:text-primary transition-colors">HR Dashboard</Link>
          </div>

          <Link to="/hr/login">
            <Button variant="outline" size="lg" className="border-stone-200 hover:border-primary/50 backdrop-blur-md bg-white/50">
              Sign In
            </Button>
          </Link>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="animate-reveal-up">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-orange-200 bg-orange-50 text-primary text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                V2.0 Now Live • AI Powered Interviews
              </div>

              <h1 className="font-display text-5xl sm:text-7xl leading-[1.1] font-extrabold mb-8 text-stone-900">
                The Future of <br />
                <span className="text-gradient">Technical Hiring</span>
              </h1>

              <p className="text-stone-600 text-xl leading-relaxed max-w-xl mb-12">
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
                  <Button variant="outline" size="xl" className="px-10 h-16 text-lg border-stone-200 hover:bg-orange-50/50 backdrop-blur-sm bg-white/50">
                    Enter Job Code
                    <Play className="ml-3 w-5 h-5 fill-current" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {keyStats.map((stat) => (
                  <div key={stat.label} className="p-4 rounded-2xl bg-white border border-stone-100 shadow-sm group hover:border-primary/30 transition-all duration-500">
                    <stat.icon className="w-5 h-5 text-primary mb-3" />
                    <p className="font-display text-3xl font-bold text-stone-900 mb-1 group-hover:scale-110 origin-left transition-transform">{stat.value}</p>
                    <p className="text-xs text-stone-500 font-bold uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Preview Component */}
            <div className="relative animate-reveal-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -inset-4 bg-gradient-primary opacity-10 blur-[80px] -z-10 animate-pulse" />
              <Card className="border-stone-200 bg-white/80 backdrop-blur-xl overflow-hidden shadow-2xl ring-1 ring-stone-100">
                <div className="h-10 bg-stone-50 border-b border-stone-100 flex items-center px-4 gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest ml-4 font-bold">Interview Analysis Session</span>
                </div>
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-secondary flex items-center justify-center text-2xl shadow-md">👩‍💼</div>
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 leading-tight">Ms. Aarushi</h3>
                      <p className="text-xs text-secondary font-bold uppercase tracking-widest">AI Interviewer • Active</p>
                    </div>
                  </div>

                  <div className="space-y-6 mb-10">
                    <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 relative">
                      <p className="text-[10px] text-stone-400 font-bold uppercase mb-2">Question</p>
                      <p className="text-sm text-stone-700 italic leading-relaxed">
                        "Explain the CAP theorem and how it influences your choice of database for a global financial ledger."
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 relative ml-8">
                      <p className="text-[10px] text-primary font-bold uppercase mb-2">Confidence Score: 94%</p>
                      <p className="text-sm text-stone-800 leading-relaxed font-medium">
                        The candidate explains that consistency is non-negotiable for a ledger, choosing CP systems like Spanner or RDBMS over AP systems.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {['Technical', 'Soft Skills', 'Clarity'].map((metric, i) => (
                      <div key={metric} className="text-center">
                        <div className="h-1 bg-stone-100 rounded-full mb-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-primary rounded-full transition-all duration-1000" 
                            style={{ width: `${80 + i * 5}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">{metric}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-32 border-t border-stone-100">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-6">Cutting-Edge Features</h2>
            <h3 className="text-4xl sm:text-5xl font-display font-bold text-stone-900 mb-6">Designed for Enterprise Scale</h3>
            <p className="text-stone-600 text-lg">Every tool you need to build a high-performance engineering culture, powered by advanced LLMs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featureHighlights.map((feature, index) => (
              <Card key={feature.title} className="bg-white border-stone-100 hover:border-primary/30 transition-all duration-500 group shadow-sm hover:shadow-xl">
                <CardContent className="p-10">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", feature.bg, feature.color)}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-bold text-stone-900 mb-4">{feature.title}</h4>
                  <p className="text-stone-600 leading-relaxed text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-7xl mx-auto px-6 py-32">
           <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-[40px] p-16 sm:p-24 text-center border border-orange-100 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
             <h3 className="text-4xl sm:text-6xl font-display font-bold text-stone-900 mb-10 relative z-10">Ready to transform <br/> your hiring process?</h3>
             <Link to="/hr/login" className="relative z-10">
               <Button variant="premium" size="xl" className="px-16 h-20 text-2xl shadow-lg hover:scale-105 transition-transform">
                 Get Started For Free
                 <ArrowRight className="ml-4 w-8 h-8" />
               </Button>
             </Link>
             <p className="mt-8 text-stone-500 font-bold uppercase tracking-widest text-sm relative z-10 animate-pulse">Join 500+ tech teams scaling with AI</p>
           </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 pb-20 pt-10 border-t border-stone-100 text-stone-500 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center">
               <Mic className="w-4 h-4 text-stone-600" />
             </div>
             <p className="font-bold text-stone-900">InterviewAI</p>
          </div>
          
          <div className="flex gap-10 text-xs font-bold uppercase tracking-widest">
            <a href="https://github.com/hemangsengar/Interview-AI-Tool-HR" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Source Code</a>
            <p>© 2026 Crafted by Hemang</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Landing

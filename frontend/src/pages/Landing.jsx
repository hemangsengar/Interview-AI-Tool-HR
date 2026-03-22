import { useEffect } from 'react'
import { Link } from 'react-router-dom'

// Warm up the backend on landing page load (handles Render cold start)
const warmUpBackend = async () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  try {
    // Silent ping to wake up the backend
    await fetch(`${apiUrl}/health`, { mode: 'cors' })
    console.log('[WARMUP] Backend is ready!')
  } catch (e) {
    // Silently ignore errors - backend might still be starting
    console.log('[WARMUP] Backend warming up...')
  }
}

const Landing = () => {
  // Warm up backend on mount
  useEffect(() => {
    warmUpBackend()
  }, [])

  const keyStats = [
    { value: '3x', label: 'Faster first-round screening' },
    { value: '24/7', label: 'Interview availability' },
    { value: '100%', label: 'Standardized evaluation flow' }
  ]

  const featureHighlights = [
    {
      title: 'Adaptive AI Interview Flow',
      description: 'Questions evolve in real time based on candidate answers, confidence, and domain depth.'
    },
    {
      title: 'Voice + Transcript Intelligence',
      description: 'Capture conversation quality, technical clarity, and communication patterns in one place.'
    },
    {
      title: 'Actionable Hiring Dashboard',
      description: 'Recruiters get interview summaries, score distribution, and recommendation confidence quickly.'
    }
  ]

  const processSteps = [
    {
      title: 'Define Role',
      detail: 'Create job requirements and role priorities from your HR dashboard.'
    },
    {
      title: 'Invite Candidates',
      detail: 'Share interview links and let candidates complete assessments on their schedule.'
    },
    {
      title: 'Analyze Results',
      detail: 'Review scores, transcripts, and insights to shortlist confidently.'
    }
  ]

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-mesh" />

      <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-primary/25 rounded-full blur-3xl animate-float" />
      <div className="absolute top-1/2 -right-24 w-[30rem] h-[30rem] bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.7s' }} />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      <div className="relative z-10">
        <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 glass rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div>
              <p className="font-display text-xl">InterviewAI</p>
              <p className="text-xs text-slate-400">Voice Hiring Platform</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#creator" className="hover:text-white transition-colors">Creator</a>
          </div>

          <Link to="/hr/login" className="hidden sm:inline-flex px-4 py-2 rounded-xl glass hover:border-primary/50 transition-all text-sm font-semibold">
            Open HR Portal
          </Link>
        </nav>

        <section className="max-w-7xl mx-auto px-6 pt-10 pb-16 lg:pt-16 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-reveal-up" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary-light text-xs font-semibold uppercase tracking-[0.12em]">
                Built For Modern Hiring Teams
              </div>

              <h1 className="mt-6 font-display text-4xl sm:text-5xl lg:text-6xl leading-tight">
                <span className="text-white">Turn Candidate Interviews Into</span>{' '}
                <span className="text-gradient">Reliable Hiring Signals</span>
              </h1>

              <p className="mt-6 text-slate-300 text-lg max-w-xl">
                InterviewAI conducts intelligent voice interviews, adapts follow-up questions, and produces recruiter-ready insights in minutes.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/hr/login" className="btn-primary text-center px-7 py-4 rounded-2xl">
                  Launch HR Dashboard
                </Link>
                <Link to="/candidate" className="btn-secondary text-center px-7 py-4 rounded-2xl border border-primary/50">
                  Join Candidate Interview
                </Link>
              </div>

              <div className="mt-10 grid sm:grid-cols-3 gap-4">
                {keyStats.map((stat) => (
                  <div key={stat.label} className="glass rounded-2xl px-4 py-4">
                    <p className="font-display text-2xl text-primary-light">{stat.value}</p>
                    <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-reveal-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative glass rounded-3xl p-6 sm:p-8 border border-primary/30">
                <div className="absolute -inset-1 rounded-3xl bg-gradient-primary opacity-15 blur-xl pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-slate-300 text-sm">Live Interview Preview</p>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-300/20 text-emerald-300 text-xs font-semibold">Active Session</span>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl bg-slate-900/60 border border-slate-700/60 p-4">
                      <p className="text-xs text-slate-400 mb-2">AI Interviewer</p>
                      <p className="text-slate-200">Explain the trade-offs between SQL and NoSQL for a high-read analytics system.</p>
                    </div>
                    <div className="rounded-2xl bg-primary/10 border border-primary/30 p-4">
                      <p className="text-xs text-primary-light mb-2">Candidate Response</p>
                      <p className="text-slate-100">I would choose SQL for strict consistency in reporting, but use a NoSQL cache for burst reads and low latency.</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-slate-900/65 p-3 border border-slate-700/60">
                      <p className="text-xs text-slate-400">Clarity</p>
                      <p className="font-display text-lg text-primary-light">8.7</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/65 p-3 border border-slate-700/60">
                      <p className="text-xs text-slate-400">Depth</p>
                      <p className="font-display text-lg text-secondary-light">8.2</p>
                    </div>
                    <div className="rounded-xl bg-slate-900/65 p-3 border border-slate-700/60">
                      <p className="text-xs text-slate-400">Relevance</p>
                      <p className="font-display text-lg text-accent-light">9.1</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="max-w-7xl mx-auto px-6 py-8 sm:py-12">
          <div className="grid md:grid-cols-3 gap-6">
            {featureHighlights.map((feature, index) => (
              <article key={feature.title} className="card animate-reveal-up" style={{ animationDelay: `${0.15 * index}s` }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-primary mb-4" />
                <h3 className="font-display text-xl text-white">{feature.title}</h3>
                <p className="mt-3 text-slate-300 text-sm leading-relaxed">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-secondary-light text-xs font-semibold tracking-[0.18em] uppercase">How It Works</p>
            <h2 className="font-display text-3xl sm:text-4xl mt-4">Simple Workflow, High-Quality Decisions</h2>
            <p className="text-slate-300 mt-4">From job setup to final recommendation, your team gets a consistent and auditable process.</p>
          </div>

          <div className="mt-10 grid md:grid-cols-3 gap-6">
            {processSteps.map((step, index) => (
              <div key={step.title} className="glass rounded-2xl p-6 border border-slate-700/60">
                <p className="font-display text-4xl text-primary-light">0{index + 1}</p>
                <h3 className="font-display text-xl mt-4">{step.title}</h3>
                <p className="mt-3 text-slate-300 text-sm">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="creator" className="max-w-7xl mx-auto px-6 pb-20">
          <div className="glass rounded-3xl p-8 sm:p-10 border border-primary/25">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-slate-400 uppercase text-xs tracking-[0.16em]">Creator</p>
                <h3 className="font-display text-2xl sm:text-3xl mt-3">Hemang Singh Sengar</h3>
                <p className="text-slate-300 mt-3 max-w-2xl">Building practical AI systems that improve hiring speed and decision quality for teams of all sizes.</p>
              </div>

              <div className="flex gap-3">
                <a
                  href="https://github.com/hemangsengar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl border border-slate-600 hover:border-primary/60 hover:text-primary-light transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="https://linkedin.com/in/hemangsengar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 rounded-xl border border-slate-600 hover:border-primary/60 hover:text-primary-light transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="max-w-7xl mx-auto px-6 pb-10 text-sm text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 InterviewAI. All rights reserved.</p>
          <a
            href="https://github.com/hemangsengar/Interview-AI-Tool-HR"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            View Source
          </a>
        </footer>
      </div>
    </div>
  )
}

export default Landing

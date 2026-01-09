import { Link } from 'react-router-dom'

const Landing = () => {
  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Animated mesh background */}
      <div className="absolute inset-0 bg-gradient-mesh" />

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Main content */}
      <div className="relative min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-5xl">
          {/* Logo/Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-50 animate-pulse-glow" />
              <div className="relative w-24 h-24 glass rounded-full flex items-center justify-center">
                <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Title with gradient */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-gradient">AI Voice</span>
            <br />
            <span className="text-white">Interviewer</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-300 mb-4">
            Intelligent Voice Interviews with Real-Time Analysis
          </p>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
            Experience the future of hiring with AI-powered voice interviews,
            instant evaluation, and comprehensive insights
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              to="/hr/login"
              className="group relative px-8 py-4 bg-gradient-primary rounded-2xl font-semibold text-lg text-white
                shadow-glow-primary hover:shadow-[0_0_50px_rgba(124,58,237,0.5)] 
                transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🏢</span>
                <span>HR Portal</span>
              </span>
            </Link>

            <Link
              to="/candidate"
              className="group relative px-8 py-4 glass border-2 border-primary/50 rounded-2xl 
                font-semibold text-lg text-white hover:bg-primary/20 hover:border-primary
                transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                <span>🎤</span>
                <span>Join Interview</span>
              </span>
            </Link>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card group cursor-default">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered</h3>
              <p className="text-slate-400">
                Smart questions adapted to each candidate&apos;s unique profile and experience
              </p>
            </div>

            <div className="card group cursor-default">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
              <h3 className="text-xl font-bold text-white mb-2">Real-Time Scoring</h3>
              <p className="text-slate-400">
                Instant evaluation on correctness, depth, clarity, and relevance
              </p>
            </div>

            <div className="card group cursor-default">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
              <h3 className="text-xl font-bold text-white mb-2">Detailed Reports</h3>
              <p className="text-slate-400">
                Comprehensive insights with transcripts for better hiring decisions
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">15+</div>
              <div className="text-slate-400 text-sm">Questions per Interview</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-secondary">4</div>
              <div className="text-slate-400 text-sm">Scoring Dimensions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">AI</div>
              <div className="text-slate-400 text-sm">Powered by Gemini</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark to-transparent" />
    </div>
  )
}

export default Landing

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

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">InterviewAI</span>
        </div>
        <div className="flex gap-4">
          <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">How it Works</a>
          <a href="#use-cases" className="text-slate-300 hover:text-white transition-colors">Use Cases</a>
          <a href="#tech" className="text-slate-300 hover:text-white transition-colors">Tech</a>
          <a href="#creator" className="text-slate-300 hover:text-white transition-colors">Creator</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center p-6">
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
            Automate your hiring process with AI-powered voice interviews.
            Get instant candidate evaluation, detailed transcripts, and data-driven hiring recommendations.
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
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            <span className="text-gradient">How It Works</span>
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            A seamless AI-driven interview experience from job posting to hiring decision
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center text-3xl">
                1️⃣
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Create Job</h3>
              <p className="text-slate-400 text-sm">
                HR posts job description with required skills. AI extracts key requirements automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center text-3xl">
                2️⃣
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Candidate Applies</h3>
              <p className="text-slate-400 text-sm">
                Candidate uploads resume and enters interview. AI parses skills and experience.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center text-3xl">
                3️⃣
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Interview</h3>
              <p className="text-slate-400 text-sm">
                Real-time voice conversation with AI. Adaptive questions based on responses.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 glass rounded-2xl flex items-center justify-center text-3xl">
                4️⃣
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Get Results</h3>
              <p className="text-slate-400 text-sm">
                Detailed scorecard, full transcript, and AI recommendation delivered to HR.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="relative py-24 px-6 bg-dark/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            <span className="text-gradient-secondary">Use Cases</span>
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Built for modern hiring teams across industries
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Use Case 1 */}
            <div className="card">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-bold text-white mb-3">Startups & SMBs</h3>
              <p className="text-slate-400 text-sm mb-4">
                No dedicated HR team? Let AI handle initial screening while you focus on building your product.
              </p>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>✓ 24/7 interview availability</li>
                <li>✓ Consistent evaluation criteria</li>
                <li>✓ Save 10+ hours per hire</li>
              </ul>
            </div>

            {/* Use Case 2 */}
            <div className="card">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-white mb-3">Campus Recruitment</h3>
              <p className="text-slate-400 text-sm mb-4">
                Screen hundreds of fresh graduates efficiently with standardized AI interviews.
              </p>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>✓ Handle high volume</li>
                <li>✓ Fair & unbiased screening</li>
                <li>✓ Identify top talent faster</li>
              </ul>
            </div>

            {/* Use Case 3 */}
            <div className="card">
              <div className="text-4xl mb-4">💼</div>
              <h3 className="text-xl font-bold text-white mb-3">Technical Hiring</h3>
              <p className="text-slate-400 text-sm mb-4">
                Evaluate coding skills and technical depth through conversational AI interviews.
              </p>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>✓ Skill-based questions</li>
                <li>✓ Project deep-dives</li>
                <li>✓ Technical scoring</li>
              </ul>
            </div>

            {/* Use Case 4 */}
            <div className="card">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-white mb-3">Remote Hiring</h3>
              <p className="text-slate-400 text-sm mb-4">
                Interview candidates across timezones without scheduling hassles.
              </p>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>✓ Any time, anywhere</li>
                <li>✓ No coordinator needed</li>
                <li>✓ Recorded for review</li>
              </ul>
            </div>

            {/* Use Case 5 */}
            <div className="card">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-white mb-3">Scale Operations</h3>
              <p className="text-slate-400 text-sm mb-4">
                Growing fast? Scale your hiring without scaling your HR team proportionally.
              </p>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>✓ Unlimited interviews</li>
                <li>✓ Consistent quality</li>
                <li>✓ Data-driven decisions</li>
              </ul>
            </div>

            {/* Use Case 6 */}
            <div className="card">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-white mb-3">Pre-Screening</h3>
              <p className="text-slate-400 text-sm mb-4">
                Filter candidates before human interviews to save your team&apos;s valuable time.
              </p>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>✓ Shortlist top 20%</li>
                <li>✓ Objective rankings</li>
                <li>✓ Detailed reports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech" className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            <span className="text-gradient">Powered By</span>
          </h2>
          <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
            Built with cutting-edge AI and modern web technologies
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glass p-6 rounded-2xl text-center hover:border-primary/50 transition-all">
              <div className="text-4xl mb-3">🧠</div>
              <h4 className="font-semibold text-white">Claude AI</h4>
              <p className="text-slate-400 text-xs mt-1">Anthropic</p>
            </div>
            <div className="glass p-6 rounded-2xl text-center hover:border-primary/50 transition-all">
              <div className="text-4xl mb-3">⚛️</div>
              <h4 className="font-semibold text-white">React</h4>
              <p className="text-slate-400 text-xs mt-1">Frontend</p>
            </div>
            <div className="glass p-6 rounded-2xl text-center hover:border-primary/50 transition-all">
              <div className="text-4xl mb-3">🐍</div>
              <h4 className="font-semibold text-white">FastAPI</h4>
              <p className="text-slate-400 text-xs mt-1">Backend</p>
            </div>
            <div className="glass p-6 rounded-2xl text-center hover:border-primary/50 transition-all">
              <div className="text-4xl mb-3">🎙️</div>
              <h4 className="font-semibold text-white">Speech AI</h4>
              <p className="text-slate-400 text-xs mt-1">Sarvam STT/TTS</p>
            </div>
          </div>
        </div>
      </section>

      {/* Creator Section */}
      <section id="creator" className="relative py-24 px-6 bg-dark/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gradient-secondary">Built By</span>
          </h2>

          <div className="card max-w-md mx-auto mt-12">
            {/* Avatar placeholder */}
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-4xl font-bold text-white">HS</span>
            </div>

            <h3 className="text-2xl font-bold text-white mb-2">Hemang Singh Sengar</h3>
            <p className="text-gradient text-lg mb-4">Engineer</p>

            <p className="text-slate-400 mb-6">
              Building AI-powered tools to make hiring smarter, faster, and more accessible.
            </p>

            {/* Social Links */}
            <div className="flex justify-center gap-4">
              <a
                href="https://github.com/hemangsengar"
                target="_blank"
                rel="noopener noreferrer"
                className="glass px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-primary/20 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/hemangsengar"
                target="_blank"
                rel="noopener noreferrer"
                className="glass px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-primary/20 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">InterviewAI</span>
            </div>

            <div className="text-slate-400 text-sm">
              © 2025 InterviewAI. Built with ❤️ by Hemang Singh Sengar
            </div>

            <div className="flex gap-4">
              <a
                href="https://github.com/hemangsengar/Interview-AI-Tool-HR"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors"
              >
                View Source
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-dark to-transparent pointer-events-none" />
    </div>
  )
}

export default Landing

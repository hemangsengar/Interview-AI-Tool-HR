import { Link } from 'react-router-dom'

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-rose-500 to-purple-600">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 right-1/4 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="text-center text-white max-w-4xl">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-yellow-100 to-orange-100">
            Avatar Voice Interviewer
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-4 text-orange-50">
            AI-Powered Voice Interviews with Animated Avatar
          </p>
          <p className="text-lg mb-12 text-orange-100 max-w-2xl mx-auto">
            Experience the future of hiring with intelligent voice interviews, real-time evaluation, and instant insights
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/hr/login"
              className="group relative px-8 py-4 bg-white text-orange-600 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              <span className="relative z-10">🏢 HR Portal</span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-rose-400 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </Link>
            <Link
              to="/candidate"
              className="group relative px-8 py-4 bg-white bg-opacity-10 backdrop-blur-sm border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-orange-600 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
            >
              🎤 Join Interview
            </Link>
          </div>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-20 transition-all">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-orange-50">Smart questions adapted to each candidate's profile</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-20 transition-all">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Real-Time Scoring</h3>
              <p className="text-sm text-orange-50">Instant evaluation on multiple dimensions</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 hover:bg-opacity-20 transition-all">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Detailed Reports</h3>
              <p className="text-sm text-orange-50">Comprehensive insights for better hiring decisions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing

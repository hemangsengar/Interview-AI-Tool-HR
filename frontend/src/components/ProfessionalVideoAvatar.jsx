import { useEffect, useRef } from 'react'

const ProfessionalVideoAvatar = ({ state = 'idle', subtitle = '', avatarType = 'male' }) => {
  const videoRef = useRef(null)
  
  // Select avatar based on type
  const avatarVideoUrl = avatarType === 'female' ? "/avatar_female.mp4" : "/avatar.mp4"

  useEffect(() => {
    if (videoRef.current) {
      if (state === 'speaking') {
        // Play video when speaking
        videoRef.current.play().catch(e => console.log('Video play error:', e))
      } else {
        // Pause video when not speaking (looks like listening)
        videoRef.current.pause()
      }
    }
  }, [state])

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Professional Video Avatar */}
      <div className="relative w-80 h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-white">
        {/* Professional Office Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900">
          <div className="absolute top-10 right-10 w-20 h-32 bg-slate-600 opacity-20 rounded-lg"></div>
          <div className="absolute bottom-10 left-10 w-16 h-16 bg-slate-600 opacity-20 rounded-full"></div>
        </div>
        
        {/* Video Avatar - Always Visible */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              src={avatarVideoUrl}
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
              onError={(e) => {
                console.log('Video load error:', e)
                console.log('Video URL:', avatarVideoUrl)
              }}
              onLoadedData={() => {
                console.log('Video loaded successfully')
              }}
            />
            
            {/* Overlay gradient for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            
            {/* Visual effects based on state */}
            {state === 'listening' && (
              <div className="absolute inset-0 animate-pulse" style={{
                background: 'radial-gradient(circle at 60% 40%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)'
              }}></div>
            )}
            
            {state === 'thinking' && (
              <div className="absolute inset-0 animate-pulse" style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)'
              }}></div>
            )}
            
            {/* Professional name tag */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm px-6 py-2 rounded-full shadow-lg">
              <p className="text-sm font-bold text-gray-800">
                {avatarType === 'female' ? 'Aarushi 👩‍💼' : 'Aarush 👨‍💼'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Status Indicators */}
        {state === 'thinking' && (
          <div className="absolute top-4 right-4 flex space-x-1 bg-purple-500/90 px-3 py-2 rounded-full animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        )}
        
        {state === 'listening' && (
          <div className="absolute top-4 left-4 bg-red-500/90 px-3 py-2 rounded-full animate-pulse">
            <div className="flex space-x-1">
              <div className="w-1 h-8 bg-white rounded-full animate-pulse"></div>
              <div className="w-1 h-6 bg-white rounded-full animate-pulse" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1 h-10 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1 h-7 bg-white rounded-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
            </div>
          </div>
        )}
        
        {state === 'speaking' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500/90 px-4 py-2 rounded-full animate-pulse">
            <div className="flex space-x-1 items-center">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
              <div className="w-2 h-2 bg-white rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-white rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
              <span className="ml-2 text-white text-xs font-bold">SPEAKING</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Status Badge */}
      <div className="mt-6 px-6 py-3 rounded-full bg-white shadow-lg border-2 border-gray-200">
        <span className={`
          font-bold text-base
          ${state === 'speaking' ? 'text-blue-600' : ''}
          ${state === 'listening' ? 'text-red-600' : ''}
          ${state === 'thinking' ? 'text-purple-600' : ''}
          ${state === 'idle' ? 'text-gray-600' : ''}
        `}>
          {state === 'speaking' && '🗣️ Speaking'}
          {state === 'listening' && '👂 Listening'}
          {state === 'thinking' && '🤔 Processing'}
          {state === 'idle' && '😊 Ready'}
        </span>
      </div>
      
      {/* Subtitle */}
      {subtitle && (
        <div className="mt-6 max-w-lg p-6 bg-white rounded-2xl shadow-lg border-2 border-gray-200">
          <p className="text-center text-gray-800 text-lg leading-relaxed">{subtitle}</p>
        </div>
      )}
    </div>
  )
}

export default ProfessionalVideoAvatar

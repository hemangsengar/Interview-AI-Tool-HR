import { useEffect, useRef, useState } from 'react'

/**
 * AudioVisualizer - A circular orb that reacts to audio
 * Replaces the video avatar with a modern, abstract visualization
 */
const AudioVisualizer = ({
    state = 'idle', // idle, speaking, listening, thinking
    audioStream = null, // MediaStream for analysis
    subtitle = '',
    speakerName = 'AI Interviewer'
}) => {
    const canvasRef = useRef(null)
    const animationRef = useRef(null)
    const analyserRef = useRef(null)
    const dataArrayRef = useRef(null)
    const [audioLevel, setAudioLevel] = useState(0)

    // Setup audio analyzer when stream is available
    useEffect(() => {
        if (audioStream && state === 'listening') {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)()
                const analyser = audioContext.createAnalyser()
                const source = audioContext.createMediaStreamSource(audioStream)

                analyser.fftSize = 256
                analyser.smoothingTimeConstant = 0.8
                source.connect(analyser)

                analyserRef.current = analyser
                dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount)
            } catch (error) {
                console.log('Audio analysis not available:', error)
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [audioStream, state])

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const baseRadius = 80

        let time = 0

        const animate = () => {
            time += 0.02

            // Get audio level if available
            let level = 0
            if (analyserRef.current && dataArrayRef.current && state === 'listening') {
                analyserRef.current.getByteFrequencyData(dataArrayRef.current)
                const sum = dataArrayRef.current.reduce((a, b) => a + b, 0)
                level = sum / dataArrayRef.current.length / 255
                setAudioLevel(level)
            }

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw based on state
            switch (state) {
                case 'speaking':
                    drawSpeakingOrb(ctx, centerX, centerY, baseRadius, time)
                    break
                case 'listening':
                    drawListeningOrb(ctx, centerX, centerY, baseRadius, time, level)
                    break
                case 'thinking':
                    drawThinkingOrb(ctx, centerX, centerY, baseRadius, time)
                    break
                default:
                    drawIdleOrb(ctx, centerX, centerY, baseRadius, time)
            }

            animationRef.current = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [state])

    // Idle state - gentle pulsing orb
    const drawIdleOrb = (ctx, cx, cy, radius, time) => {
        const pulseRadius = radius + Math.sin(time) * 5

        // Outer glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius * 2)
        gradient.addColorStop(0, 'rgba(124, 58, 237, 0.4)')
        gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.1)')
        gradient.addColorStop(1, 'rgba(124, 58, 237, 0)')

        ctx.beginPath()
        ctx.arc(cx, cy, pulseRadius * 2, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Main orb
        const orbGradient = ctx.createRadialGradient(cx - 20, cy - 20, 0, cx, cy, pulseRadius)
        orbGradient.addColorStop(0, '#A78BFA')
        orbGradient.addColorStop(0.5, '#7C3AED')
        orbGradient.addColorStop(1, '#5B21B6')

        ctx.beginPath()
        ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2)
        ctx.fillStyle = orbGradient
        ctx.fill()

        // Inner highlight
        ctx.beginPath()
        ctx.arc(cx - 25, cy - 25, pulseRadius * 0.3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.fill()
    }

    // Speaking state - active pulsing with sound waves
    const drawSpeakingOrb = (ctx, cx, cy, radius, time) => {
        // Sound wave rings
        for (let i = 0; i < 3; i++) {
            const waveRadius = radius + 30 + (time * 50 + i * 40) % 100
            const alpha = 1 - ((time * 50 + i * 40) % 100) / 100

            ctx.beginPath()
            ctx.arc(cx, cy, waveRadius, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(236, 72, 153, ${alpha * 0.5})`
            ctx.lineWidth = 3
            ctx.stroke()
        }

        // Animated radius
        const pulseRadius = radius + Math.sin(time * 3) * 15 + Math.sin(time * 7) * 5

        // Outer glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius * 1.8)
        gradient.addColorStop(0, 'rgba(236, 72, 153, 0.5)')
        gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.2)')
        gradient.addColorStop(1, 'rgba(124, 58, 237, 0)')

        ctx.beginPath()
        ctx.arc(cx, cy, pulseRadius * 1.8, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Main orb with gradient animation
        const orbGradient = ctx.createRadialGradient(cx - 20, cy - 20, 0, cx, cy, pulseRadius)
        orbGradient.addColorStop(0, '#F472B6')
        orbGradient.addColorStop(0.5, '#EC4899')
        orbGradient.addColorStop(1, '#7C3AED')

        ctx.beginPath()
        ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2)
        ctx.fillStyle = orbGradient
        ctx.fill()

        // Highlight
        ctx.beginPath()
        ctx.arc(cx - 25, cy - 25, pulseRadius * 0.25, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fill()
    }

    // Listening state - responsive to audio input
    const drawListeningOrb = (ctx, cx, cy, radius, time, audioLevel) => {
        const intensity = Math.max(0.3, audioLevel * 2)
        const pulseRadius = radius + intensity * 30 + Math.sin(time * 2) * 5

        // Audio reactive rings
        const numBars = 32
        for (let i = 0; i < numBars; i++) {
            const angle = (i / numBars) * Math.PI * 2
            const barHeight = 20 + (dataArrayRef.current ? dataArrayRef.current[i % dataArrayRef.current.length] / 255 * 40 : Math.random() * 20)
            const innerRadius = pulseRadius + 10
            const outerRadius = innerRadius + barHeight

            const x1 = cx + Math.cos(angle) * innerRadius
            const y1 = cy + Math.sin(angle) * innerRadius
            const x2 = cx + Math.cos(angle) * outerRadius
            const y2 = cy + Math.sin(angle) * outerRadius

            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 + intensity * 0.5})`
            ctx.lineWidth = 3
            ctx.lineCap = 'round'
            ctx.stroke()
        }

        // Outer glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius * 1.5)
        gradient.addColorStop(0, `rgba(239, 68, 68, ${0.4 + intensity * 0.3})`)
        gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.1)')
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')

        ctx.beginPath()
        ctx.arc(cx, cy, pulseRadius * 1.5, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Main orb
        const orbGradient = ctx.createRadialGradient(cx - 20, cy - 20, 0, cx, cy, pulseRadius)
        orbGradient.addColorStop(0, '#FCA5A5')
        orbGradient.addColorStop(0.5, '#EF4444')
        orbGradient.addColorStop(1, '#DC2626')

        ctx.beginPath()
        ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2)
        ctx.fillStyle = orbGradient
        ctx.fill()
    }

    // Thinking state - rotating particles
    const drawThinkingOrb = (ctx, cx, cy, radius, time) => {
        const pulseRadius = radius + Math.sin(time * 2) * 3

        // Rotating particles
        const numParticles = 8
        for (let i = 0; i < numParticles; i++) {
            const angle = (i / numParticles) * Math.PI * 2 + time * 2
            const orbitRadius = pulseRadius + 30
            const particleX = cx + Math.cos(angle) * orbitRadius
            const particleY = cy + Math.sin(angle) * orbitRadius
            const particleSize = 6 + Math.sin(time * 3 + i) * 2

            ctx.beginPath()
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(168, 85, 247, ${0.5 + Math.sin(time + i) * 0.3})`
            ctx.fill()
        }

        // Outer glow
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius * 1.5)
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)')
        gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.1)')
        gradient.addColorStop(1, 'rgba(168, 85, 247, 0)')

        ctx.beginPath()
        ctx.arc(cx, cy, pulseRadius * 1.5, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Main orb
        const orbGradient = ctx.createRadialGradient(cx - 20, cy - 20, 0, cx, cy, pulseRadius)
        orbGradient.addColorStop(0, '#C4B5FD')
        orbGradient.addColorStop(0.5, '#A855F7')
        orbGradient.addColorStop(1, '#7C3AED')

        ctx.beginPath()
        ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2)
        ctx.fillStyle = orbGradient
        ctx.fill()
    }

    // State colors for UI elements
    const stateConfig = {
        idle: { color: 'text-slate-400', bg: 'bg-slate-500/20', label: '😊 Ready' },
        speaking: { color: 'text-pink-400', bg: 'bg-pink-500/20', label: '🗣️ Speaking' },
        listening: { color: 'text-red-400', bg: 'bg-red-500/20', label: '🎤 Listening' },
        thinking: { color: 'text-purple-400', bg: 'bg-purple-500/20', label: '🤔 Processing' }
    }

    const currentState = stateConfig[state] || stateConfig.idle

    return (
        <div className="flex flex-col items-center justify-center p-6">
            {/* Visualizer Container */}
            <div className="relative">
                {/* Background glow effect */}
                <div
                    className={`absolute inset-0 rounded-full blur-3xl opacity-30 transition-all duration-500 ${state === 'speaking' ? 'bg-pink-500' :
                            state === 'listening' ? 'bg-red-500' :
                                state === 'thinking' ? 'bg-purple-500' :
                                    'bg-primary'
                        }`}
                    style={{ transform: 'scale(1.5)' }}
                />

                {/* Canvas for visualization */}
                <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    className="relative z-10"
                />

                {/* State indicator badge */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 
          px-4 py-1.5 rounded-full glass ${currentState.bg} ${currentState.color}
          text-sm font-semibold transition-all duration-300`}>
                    {currentState.label}
                </div>
            </div>

            {/* Speaker name */}
            <div className="mt-4 px-6 py-2 rounded-full glass">
                <p className="text-sm font-semibold text-white">
                    {speakerName} 🎯
                </p>
            </div>

            {/* Subtitle/Question display */}
            {subtitle && (
                <div className="mt-6 max-w-lg p-6 rounded-2xl glass">
                    <p className="text-center text-white/90 text-lg leading-relaxed">
                        {subtitle}
                    </p>
                </div>
            )}

            {/* Audio level indicator for listening state */}
            {state === 'listening' && (
                <div className="mt-4 flex items-center gap-2">
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-red-500 rounded-full transition-all duration-100"
                                style={{
                                    height: `${12 + (audioLevel > (i * 0.2) ? audioLevel * 20 : 0)}px`,
                                    opacity: audioLevel > (i * 0.2) ? 1 : 0.3
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-red-400 font-medium">Listening...</span>
                </div>
            )}
        </div>
    )
}

export default AudioVisualizer

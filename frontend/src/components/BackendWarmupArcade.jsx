import { startTransition, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Cpu, Radar, TimerReset, Trophy, WifiOff } from 'lucide-react'
import { Button } from './ui/Button'
import { cn } from '../lib/utils'
import { ensureBackendWarmup, useBackendWarmupStore } from '../store/backendWarmupStore'

const PUBLIC_WARMUP_ROUTES = [
  /^\/$/,
  /^\/candidate(?:\/|$)/,
  /^\/hr\/login$/,
  /^\/hr\/signup$/
]

const LANE_COUNT = 3
const PLAYER_ZONE_TOP = 78
const PLAYER_ZONE_BOTTOM = 94
const GAME_TICK_MS = 120
const PLAYER_START_LANE = 1
const LANE_NAMES = ['Focus', 'Flow', 'Finish']

const buildInitialGameState = () => ({
  score: 0,
  bestScore: 0,
  hits: 0,
  streak: 0,
  flashFrames: 0,
  obstacles: [],
  spawnInMs: 520
})

const clampLane = (lane) => Math.max(0, Math.min(LANE_COUNT - 1, lane))

const createObstacle = (score) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  lane: Math.floor(Math.random() * LANE_COUNT),
  top: -14,
  speed: Math.min(9.5, 5.5 + score / 90)
})

const advanceGameState = (previousState, playerLane) => {
  let collisionDetected = false
  let clearedPackets = 0

  const shiftedObstacles = previousState.obstacles
    .map((obstacle) => {
      const nextTop = obstacle.top + obstacle.speed
      const intersectsPlayer =
        obstacle.lane === playerLane &&
        nextTop + 12 >= PLAYER_ZONE_TOP &&
        nextTop <= PLAYER_ZONE_BOTTOM

      if (intersectsPlayer) {
        collisionDetected = true
        return null
      }

      if (nextTop > 104) {
        clearedPackets += 1
        return null
      }

      return {
        ...obstacle,
        top: nextTop
      }
    })
    .filter(Boolean)

  const spawnBudget = previousState.spawnInMs - GAME_TICK_MS
  const needsSpawn = spawnBudget <= 0
  const scoreAfterClear = previousState.score + clearedPackets * 12 + 1
  const nextScore = collisionDetected ? Math.max(0, scoreAfterClear - 14) : scoreAfterClear

  return {
    score: nextScore,
    bestScore: Math.max(previousState.bestScore, nextScore),
    hits: previousState.hits + (collisionDetected ? 1 : 0),
    streak: collisionDetected ? 0 : previousState.streak + 1,
    flashFrames: collisionDetected ? 4 : Math.max(0, previousState.flashFrames - 1),
    spawnInMs: needsSpawn ? Math.max(300, 760 - nextScore * 2) : spawnBudget,
    obstacles: needsSpawn
      ? [...shiftedObstacles, createObstacle(nextScore)]
      : shiftedObstacles
  }
}

const formatElapsed = (startedAt) => {
  if (!startedAt) {
    return '0s'
  }

  const seconds = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
  return `${seconds}s`
}

const isWarmupRoute = (pathname) => PUBLIC_WARMUP_ROUTES.some((matcher) => matcher.test(pathname))

const BackendWarmupArcade = () => {
  const location = useLocation()
  const pathname = location.pathname
  const shouldRenderOnRoute = isWarmupRoute(pathname)

  const { enabled, isVisible, status, startedAt, attemptCount, reason } = useBackendWarmupStore((state) => ({
    enabled: state.enabled,
    isVisible: state.isVisible,
    status: state.status,
    startedAt: state.startedAt,
    attemptCount: state.attemptCount,
    reason: state.reason
  }))

  const [playerLane, setPlayerLane] = useState(PLAYER_START_LANE)
  const [gameState, setGameState] = useState(buildInitialGameState)
  const [elapsedLabel, setElapsedLabel] = useState('0s')
  const playerLaneRef = useRef(PLAYER_START_LANE)

  useEffect(() => {
    if (!enabled || !shouldRenderOnRoute) {
      return
    }

    void ensureBackendWarmup(`route:${pathname}`)
  }, [enabled, pathname, shouldRenderOnRoute])

  useEffect(() => {
    if (!isVisible) {
      return
    }

    setElapsedLabel(formatElapsed(startedAt))

    const timerId = window.setInterval(() => {
      setElapsedLabel(formatElapsed(startedAt))
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [isVisible, startedAt])

  useEffect(() => {
    if (!isVisible) {
      return
    }

    const handleKeyDown = (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight' && event.key !== 'a' && event.key !== 'd') {
        return
      }

      event.preventDefault()

      const direction = event.key === 'ArrowLeft' || event.key === 'a' ? -1 : 1
      const nextLane = clampLane(playerLaneRef.current + direction)
      playerLaneRef.current = nextLane
      setPlayerLane(nextLane)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) {
      return
    }

    setPlayerLane(PLAYER_START_LANE)
    playerLaneRef.current = PLAYER_START_LANE
    setGameState(buildInitialGameState())
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) {
      return
    }

    const tickId = window.setInterval(() => {
      startTransition(() => {
        setGameState((currentState) => advanceGameState(currentState, playerLaneRef.current))
      })
    }, GAME_TICK_MS)

    return () => window.clearInterval(tickId)
  }, [isVisible])

  if (!enabled || !shouldRenderOnRoute || !isVisible || status !== 'warming') {
    return null
  }

  const movePlayer = (direction) => {
    const nextLane = clampLane(playerLaneRef.current + direction)
    playerLaneRef.current = nextLane
    setPlayerLane(nextLane)
  }

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-[70] mx-auto w-auto max-w-6xl">
      <section className="pointer-events-auto overflow-hidden rounded-[2rem] border border-white/20 bg-[#08111f]/92 text-white shadow-[0_24px_80px_rgba(8,17,31,0.55)] backdrop-blur-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(132,204,22,0.14),transparent_32%),linear-gradient(135deg,rgba(8,17,31,0.96),rgba(15,23,42,0.92))]" />
        <div className="relative grid gap-8 px-5 py-5 md:grid-cols-[1.15fr_0.95fr] md:px-7 md:py-7">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-orange-200">
                <Cpu className="h-3.5 w-3.5" />
                Backend Wake Session
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-100">
                <Radar className="h-3.5 w-3.5" />
                Probe {attemptCount}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                <TimerReset className="h-3.5 w-3.5" />
                {elapsedLabel}
              </span>
            </div>

            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-bold leading-tight text-white md:text-4xl">
                Render is waking up.
                <br />
                Dodge the latency spikes until the interview engine is live.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                {reason || 'The first request after inactivity can take a while. This mini-session stays local in your browser while we keep pinging the backend.'}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Score</p>
                <p className="mt-2 font-display text-3xl font-bold text-white">{gameState.score}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Best Run</p>
                <p className="mt-2 flex items-center gap-2 font-display text-3xl font-bold text-white">
                  <Trophy className="h-5 w-5 text-amber-300" />
                  {gameState.bestScore}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Hits Taken</p>
                <p className="mt-2 flex items-center gap-2 font-display text-3xl font-bold text-white">
                  <WifiOff className="h-5 w-5 text-rose-300" />
                  {gameState.hits}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="min-w-[132px] rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                onClick={() => movePlayer(-1)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Move Left
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-w-[132px] rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                onClick={() => movePlayer(1)}
              >
                Move Right
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
                Arrow keys also work
              </p>
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-white/12 bg-[#050b14]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.28em] text-slate-400">
              <span>Signal Sprint</span>
              <span>Stay Clean</span>
            </div>

            <div
              className={cn(
                'relative h-[18rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.85),rgba(4,8,15,1))]',
                gameState.flashFrames > 0 && 'shadow-[0_0_0_1px_rgba(251,113,133,0.55),0_0_48px_rgba(251,113,133,0.2)]'
              )}
            >
              <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(56,189,248,0.08)_50%,transparent_100%)] opacity-60" />
              <div className="absolute inset-y-0 left-1/3 w-px bg-white/10" />
              <div className="absolute inset-y-0 left-2/3 w-px bg-white/10" />

              <div className="absolute inset-x-0 top-4 grid grid-cols-3 px-3 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-slate-500">
                {LANE_NAMES.map((laneName) => (
                  <span key={laneName}>{laneName}</span>
                ))}
              </div>

              {gameState.obstacles.map((obstacle) => (
                <div
                  key={obstacle.id}
                  className="absolute flex justify-center transition-transform duration-75"
                  style={{
                    left: `calc(${((obstacle.lane + 0.5) / LANE_COUNT) * 100}% - 1.25rem)`,
                    top: `${obstacle.top}%`,
                    width: '2.5rem'
                  }}
                >
                  <div className="h-12 w-8 rounded-2xl border border-orange-300/40 bg-gradient-to-b from-orange-300 via-orange-400 to-rose-500 shadow-[0_0_25px_rgba(249,115,22,0.45)]" />
                </div>
              ))}

              <div
                className="absolute bottom-5 flex w-16 -translate-x-1/2 justify-center transition-all duration-150"
                style={{
                  left: `${((playerLane + 0.5) / LANE_COUNT) * 100}%`
                }}
              >
                <div className="flex h-14 w-11 items-center justify-center rounded-[1.2rem] border border-cyan-300/40 bg-[linear-gradient(180deg,#67e8f9,#0891b2)] shadow-[0_0_35px_rgba(34,211,238,0.35)]">
                  <div className="h-4 w-4 rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.65)]" />
                </div>
              </div>

              <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300">
                <p className="font-semibold text-white">Mission</p>
                <p className="mt-1 leading-5">
                  We keep polling the backend in the background. Your browser session stays responsive, and the app will recover the moment Render returns a healthy response.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BackendWarmupArcade

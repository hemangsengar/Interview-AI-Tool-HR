import { create } from 'zustand'
import { API_BASE_URL, hasConfiguredApiBaseUrl } from '../lib/apiBaseUrl'

const HEALTHCHECK_PATH = '/health'
const HEALTHCHECK_TIMEOUT_MS = 2500
const RETRY_DELAY_MS = 4000
const REVEAL_DELAY_MS = 1600
const READY_FRESH_FOR_MS = 1000 * 60 * 5
const LONG_WAIT_MS = 1000 * 45

const isLocalApiTarget = () =>
  !API_BASE_URL ||
  API_BASE_URL.includes('localhost') ||
  API_BASE_URL.includes('127.0.0.1')

const canWarmupBackend = hasConfiguredApiBaseUrl && !isLocalApiTarget()

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getProbeUrl = () => `${API_BASE_URL}${HEALTHCHECK_PATH}`

const isReadyStillFresh = (readyAt) =>
  Boolean(readyAt) && Date.now() - readyAt < READY_FRESH_FOR_MS

const getColdStartReason = (error) => {
  if (!error) {
    return 'Render is waking the interview engine.'
  }

  const status = error.response?.status

  if (!status && error.code === 'ERR_NETWORK') {
    return 'The backend is still spinning up from cold start.'
  }

  if (!status && error.code === 'ECONNABORTED') {
    return 'The backend is taking longer than usual to respond.'
  }

  if ([502, 503, 504].includes(status)) {
    return 'The backend is not awake yet.'
  }

  return 'Render is waking the interview engine.'
}

const shouldWarmFromError = (error) => {
  if (!canWarmupBackend || !error) {
    return false
  }

  const status = error.response?.status

  return !status || [502, 503, 504].includes(status) || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED'
}

const probeBackendHealth = async () => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), HEALTHCHECK_TIMEOUT_MS)

  try {
    const response = await fetch(getProbeUrl(), {
      cache: 'no-store',
      mode: 'cors',
      signal: controller.signal
    })

    return response.ok
  } catch {
    return false
  } finally {
    window.clearTimeout(timeoutId)
  }
}

let warmupPromise = null
let revealTimerId = null

export const useBackendWarmupStore = create((set, get) => ({
  enabled: canWarmupBackend,
  status: canWarmupBackend ? 'idle' : 'disabled',
  source: null,
  startedAt: null,
  readyAt: null,
  isVisible: false,
  attemptCount: 0,
  reason: '',
  showWaitingRoom: (reason) => {
    if (!canWarmupBackend) {
      return
    }

    const currentState = get()
    const startedAt = currentState.startedAt ?? Date.now()

    set({
      status: 'warming',
      startedAt,
      isVisible: true,
      reason: reason || currentState.reason || 'Render is waking the interview engine.'
    })
  },
  markReady: () => {
    if (revealTimerId) {
      window.clearTimeout(revealTimerId)
      revealTimerId = null
    }

    set({
      status: 'ready',
      startedAt: null,
      readyAt: Date.now(),
      isVisible: false,
      reason: '',
      source: null
    })
  },
  setReason: (reason) => set({ reason }),
  setAttemptCount: (attemptCount) => set({ attemptCount }),
  setStartedAt: (startedAt) => set({ startedAt }),
  setSource: (source) => set({ source })
}))

const scheduleReveal = () => {
  if (revealTimerId) {
    window.clearTimeout(revealTimerId)
  }

  revealTimerId = window.setTimeout(() => {
    const state = useBackendWarmupStore.getState()

    if (state.status === 'warming') {
      useBackendWarmupStore.setState({ isVisible: true })
    }
  }, REVEAL_DELAY_MS)
}

export const ensureBackendWarmup = async (source = 'route', options = {}) => {
  if (!canWarmupBackend) {
    return false
  }

  const state = useBackendWarmupStore.getState()
  const shouldForce = Boolean(options.force)

  if (!shouldForce && state.status === 'ready' && isReadyStillFresh(state.readyAt)) {
    return true
  }

  if (!shouldForce && warmupPromise) {
    return warmupPromise
  }

  const startedAt = shouldForce || !state.startedAt ? Date.now() : state.startedAt
  const reason = options.reason || state.reason || 'Render is waking the interview engine.'

  useBackendWarmupStore.setState({
    status: 'warming',
    source,
    startedAt,
    isVisible: options.revealImmediately ? true : state.isVisible,
    attemptCount: shouldForce ? 0 : state.attemptCount,
    reason
  })

  if (options.revealImmediately) {
    if (revealTimerId) {
      window.clearTimeout(revealTimerId)
      revealTimerId = null
    }
  } else {
    scheduleReveal()
  }

  warmupPromise = (async () => {
    try {
      while (true) {
        const currentState = useBackendWarmupStore.getState()
        useBackendWarmupStore.setState({
          attemptCount: currentState.attemptCount + 1
        })

        const isHealthy = await probeBackendHealth()

        if (isHealthy) {
          useBackendWarmupStore.getState().markReady()
          return true
        }

        const updatedState = useBackendWarmupStore.getState()
        const waitTime = Date.now() - (updatedState.startedAt ?? Date.now())

        if (waitTime > LONG_WAIT_MS) {
          useBackendWarmupStore.setState({
            isVisible: true,
            reason: 'Still waking up. Render cold starts can take close to a minute.'
          })
        }

        await wait(RETRY_DELAY_MS)
      }
    } finally {
      warmupPromise = null
    }
  })()

  return warmupPromise
}

export const reportBackendWarmupError = (error) => {
  if (!shouldWarmFromError(error)) {
    return
  }

  const reason = getColdStartReason(error)

  useBackendWarmupStore.getState().showWaitingRoom(reason)
  void ensureBackendWarmup('request-failure', {
    force: true,
    reason,
    revealImmediately: true
  })
}

export { canWarmupBackend, shouldWarmFromError }

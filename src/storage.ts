export type TaskState = 'pending' | 'completed'
export type Task = { id: string; title: string; state: TaskState }
export type Project = {
  id: string
  name: string
  pipeline: Task[]
  backlog: Task[]
  cancelled: Task[]
}
export type AppState = {
  activeProjectId: string
  projects: Record<string, Project>
}

const storageKey = (userId: string) => `pipetask:v1:${userId}`
const DEFAULT_PROJECT_ID = 'default'

export function defaultState(): AppState {
  return {
    activeProjectId: DEFAULT_PROJECT_ID,
    projects: {
      [DEFAULT_PROJECT_ID]: {
        id: DEFAULT_PROJECT_ID,
        name: 'My project',
        pipeline: [],
        backlog: [],
        cancelled: [],
      },
    },
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isTask(v: unknown): v is Task {
  return (
    isObject(v) &&
    typeof v.id === 'string' &&
    typeof v.title === 'string' &&
    (v.state === 'pending' || v.state === 'completed')
  )
}

function isTaskArray(v: unknown): v is Task[] {
  return Array.isArray(v) && v.every(isTask)
}

function isProject(v: unknown): v is Project {
  return (
    isObject(v) &&
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    isTaskArray(v.pipeline) &&
    isTaskArray(v.backlog) &&
    isTaskArray(v.cancelled)
  )
}

function isAppState(v: unknown): v is AppState {
  if (!isObject(v) || typeof v.activeProjectId !== 'string') return false
  if (!isObject(v.projects)) return false
  const projects = v.projects
  return (
    Object.entries(projects).every(([key, p]) => isProject(p) && p.id === key) &&
    Object.prototype.hasOwnProperty.call(projects, v.activeProjectId)
  )
}

export function loadState(userId: string): AppState {
  try {
    const raw = localStorage.getItem(storageKey(userId))
    if (raw === null) return defaultState()
    const parsed: unknown = JSON.parse(raw)
    return isAppState(parsed) ? parsed : defaultState()
  } catch {
    return defaultState()
  }
}

export function saveState(userId: string, state: AppState): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(state))
  } catch {
    // storage unavailable or full; keep running in memory
  }
}

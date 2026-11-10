import { arrayMove } from '@dnd-kit/sortable'
import type { AppState, Task } from './storage'

export function createTask(title: string, id: string = crypto.randomUUID()): Task | null {
  const trimmed = title.trim()
  return trimmed ? { id, title: trimmed, state: 'pending' } : null
}

export function renameTask(tasks: Task[], id: string, title: string): Task[] {
  const trimmed = title.trim()
  if (!trimmed) return tasks
  return tasks.map((t) => (t.id === id ? { ...t, title: trimmed } : t))
}

export function toggleTaskState(tasks: Task[], id: string): Task[] {
  return tasks.map((t) =>
    t.id === id ? { ...t, state: t.state === 'pending' ? 'completed' : 'pending' } : t,
  )
}

export function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((t) => t.id !== id)
}

export function moveTask(tasks: Task[], fromId: string, toId: string): Task[] {
  const from = tasks.findIndex((t) => t.id === fromId)
  const to = tasks.findIndex((t) => t.id === toId)
  return from < 0 || to < 0 || from === to ? tasks : arrayMove(tasks, from, to)
}

export function updateActivePipeline(
  state: AppState,
  fn: (pipeline: Task[]) => Task[],
): AppState {
  const current = state.projects[state.activeProjectId]
  return {
    ...state,
    projects: {
      ...state.projects,
      [current.id]: { ...current, pipeline: fn(current.pipeline) },
    },
  }
}

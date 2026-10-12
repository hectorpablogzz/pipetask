import { useEffect, useState } from 'react'
import { loadState, saveState, type AppState } from './storage'
import { supabase } from './supabase'
import { useSession } from './useSession'
import Login from './Login'
import './App.css'

function Shell({ userId, label }: { userId: string; label: string }) {
  const [state, setState] = useState<AppState>(() => loadState(userId))
  const [title, setTitle] = useState('')

  useEffect(() => {
    saveState(userId, state)
  }, [userId, state])

  const project = state.projects[state.activeProjectId]

  function addTask(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    setState((prev) => {
      const current = prev.projects[prev.activeProjectId]
      return {
        ...prev,
        projects: {
          ...prev.projects,
          [current.id]: {
            ...current,
            pipeline: [
              ...current.pipeline,
              { id: crypto.randomUUID(), title: trimmed, state: 'pending' },
            ],
          },
        },
      }
    })
    setTitle('')
  }

  return (
    <main className="shell">
      <header>
        <h1>PipeTask</h1>
        <p className="user">
          {label}{' '}
          <button type="button" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>
        </p>
        <p className="project-name">{project.name}</p>
      </header>

      <form className="add-task" onSubmit={addTask}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task"
          aria-label="Task title"
        />
        <button type="submit">Add</button>
      </form>

      <ol className="pipeline">
        {project.pipeline.map((task) => (
          <li key={task.id} className="task" data-state={task.state}>
            <span className="task-title">{task.title}</span>
            <span className="task-state">{task.state}</span>
          </li>
        ))}
      </ol>
    </main>
  )
}

function App() {
  const { session, loading } = useSession()
  if (loading) return <main className="shell">Loading…</main>
  if (!session) return <Login />
  const { user } = session
  const label =
    user.user_metadata?.user_name ?? user.email ?? 'Signed in'
  return <Shell key={user.id} userId={user.id} label={label} />
}

export default App

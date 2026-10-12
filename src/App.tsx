import { useEffect, useState } from 'react'
import { addProject, loadState, saveState, type AppState, type Task } from './storage'
import { supabase } from './supabase'
import { useSession } from './useSession'
import Login from './Login'
import './App.css'

function Shell({ userId, label }: { userId: string; label: string }) {
  const [state, setState] = useState<AppState>(() => loadState(userId))
  const [title, setTitle] = useState('')
  const [projectName, setProjectName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [flashId, setFlashId] = useState<string | null>(null)

  useEffect(() => {
    saveState(userId, state)
  }, [userId, state])

  useEffect(() => {
    if (!flashId) return
    const t = setTimeout(() => setFlashId(null), 1200)
    return () => clearTimeout(t)
  }, [flashId])

  const project = state.projects[state.activeProjectId]
  const flashVisible = project.pipeline.some((t) => t.id === flashId)

  function createProject(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = projectName.trim()
    if (!trimmed) return
    setState((prev) => addProject(prev, trimmed))
    setProjectName('')
  }

  function updatePipeline(fn: (pipeline: Task[]) => Task[]) {
    setState((prev) => {
      const current = prev.projects[prev.activeProjectId]
      return {
        ...prev,
        projects: {
          ...prev.projects,
          [current.id]: { ...current, pipeline: fn(current.pipeline) },
        },
      }
    })
  }

  function addTask(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    updatePipeline((p) => [
      ...p,
      { id: crypto.randomUUID(), title: trimmed, state: 'pending' },
    ])
    setTitle('')
  }

  function startEdit(task: Task) {
    setEditingId(task.id)
    setEditText(task.title)
  }

  function saveEdit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = editText.trim()
    if (!trimmed) return
    updatePipeline((p) =>
      p.map((t) => (t.id === editingId ? { ...t, title: trimmed } : t)),
    )
    setEditingId(null)
  }

  function toggleTask(task: Task) {
    const completing = task.state === 'pending'
    updatePipeline((p) =>
      p.map((t) =>
        t.id === task.id
          ? { ...t, state: completing ? 'completed' : 'pending' }
          : t,
      ),
    )
    setFlashId(completing ? task.id : null)
  }

  function deleteTask(id: string) {
    updatePipeline((p) => p.filter((t) => t.id !== id))
    if (editingId === id) setEditingId(null)
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
        <div className="projects">
          <select
            value={state.activeProjectId}
            onChange={(e) => {
              setEditingId(null)
              setState((prev) => ({ ...prev, activeProjectId: e.target.value }))
            }}
            aria-label="Project"
          >
            {Object.values(state.projects).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <form onSubmit={createProject}>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="New project"
              aria-label="New project name"
            />
            <button type="submit">Create</button>
          </form>
        </div>
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

      <p className="feedback" role="status">
        {flashVisible ? 'Done! 🎉' : ''}
      </p>

      <ol className="pipeline">
        {project.pipeline.map((task) => (
          <li key={task.id} className="task"
            data-state={task.state}
            data-flash={flashId === task.id}
          >
            {editingId === task.id ? (
              <form className="edit-task" onSubmit={saveEdit}>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  aria-label="Edit task title"
                  autoFocus
                />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              <>
                <span className="task-title">{task.title}</span>
                <span className="task-actions">
                  <span className="task-state">{task.state}</span>
                  <button type="button" onClick={() => toggleTask(task)}>
                    {task.state === 'pending' ? 'Complete' : 'Revert'}
                  </button>
                  <button type="button" onClick={() => startEdit(task)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => deleteTask(task.id)}>
                    Delete
                  </button>
                </span>
              </>
            )}
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

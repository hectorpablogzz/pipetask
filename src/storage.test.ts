import { beforeEach, describe, expect, it } from 'vitest'
import { addProject, defaultState, loadState, saveState } from './storage'

function installLocalStorage() {
  const data = new Map<string, string>()
  globalThis.localStorage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() {
      return data.size
    },
  } as Storage
}

describe('storage', () => {
  beforeEach(installLocalStorage)

  it('returns the default state when nothing is stored', () => {
    expect(loadState('u1')).toEqual(defaultState())
  })

  it('round-trips saved state', () => {
    const state = addProject(defaultState(), 'Second')
    saveState('u1', state)
    expect(loadState('u1')).toEqual(state)
  })

  it('keeps state separate per user', () => {
    saveState('u1', addProject(defaultState(), 'Mine'))
    expect(loadState('u2')).toEqual(defaultState())
  })

  it('falls back to default on corrupt JSON', () => {
    localStorage.setItem('pipetask:v1:u1', '{not json')
    expect(loadState('u1')).toEqual(defaultState())
  })

  it('falls back to default when the shape is invalid', () => {
    const bad = defaultState()
    bad.projects.default.pipeline.push({ id: 'a', title: 'x', state: 'doing' as never })
    localStorage.setItem('pipetask:v1:u1', JSON.stringify(bad))
    expect(loadState('u1')).toEqual(defaultState())
  })

  it('falls back to default when the active project is missing', () => {
    const bad = { ...defaultState(), activeProjectId: 'nope' }
    localStorage.setItem('pipetask:v1:u1', JSON.stringify(bad))
    expect(loadState('u1')).toEqual(defaultState())
  })

  it('addProject adds an empty project and activates it', () => {
    const next = addProject(defaultState(), 'New')
    const project = next.projects[next.activeProjectId]
    expect(project.name).toBe('New')
    expect(project.pipeline).toEqual([])
    expect(Object.keys(next.projects)).toHaveLength(2)
  })
})

import { describe, expect, it } from 'vitest'
import { addProject, defaultState, type Task } from './storage'
import {
  createTask,
  moveTask,
  removeTask,
  renameTask,
  toggleTaskState,
  updateActivePipeline,
} from './tasks'

const t = (id: string, state: Task['state'] = 'pending'): Task => ({ id, title: `Task ${id}`, state })
const ids = (tasks: Task[]) => tasks.map((x) => x.id)

describe('createTask', () => {
  it('creates a pending task with a trimmed title', () => {
    expect(createTask('  Write docs  ', 'x')).toEqual({ id: 'x', title: 'Write docs', state: 'pending' })
  })

  it('rejects blank titles', () => {
    expect(createTask('   ')).toBeNull()
  })
})

describe('renameTask', () => {
  it('renames only the matching task', () => {
    const out = renameTask([t('a'), t('b')], 'b', ' New ')
    expect(out.map((x) => x.title)).toEqual(['Task a', 'New'])
  })

  it('ignores blank titles', () => {
    const tasks = [t('a')]
    expect(renameTask(tasks, 'a', '  ')).toBe(tasks)
  })
})

describe('toggleTaskState', () => {
  it('completes a pending task and reverts a completed one', () => {
    const done = toggleTaskState([t('a')], 'a')
    expect(done[0].state).toBe('completed')
    expect(toggleTaskState(done, 'a')[0].state).toBe('pending')
  })

  it('does not touch other tasks or mutate the input', () => {
    const input = [t('a'), t('b')]
    const out = toggleTaskState(input, 'a')
    expect(out[1]).toBe(input[1])
    expect(input[0].state).toBe('pending')
  })
})

describe('removeTask', () => {
  it('removes the task by id', () => {
    expect(ids(removeTask([t('a'), t('b'), t('c')], 'b'))).toEqual(['a', 'c'])
  })

  it('is a no-op for unknown ids', () => {
    expect(ids(removeTask([t('a')], 'zzz'))).toEqual(['a'])
  })
})

describe('moveTask', () => {
  it('moves a task down and up', () => {
    const list = [t('a'), t('b'), t('c')]
    expect(ids(moveTask(list, 'a', 'c'))).toEqual(['b', 'c', 'a'])
    expect(ids(moveTask(list, 'c', 'a'))).toEqual(['c', 'a', 'b'])
  })

  it('returns the same list for unknown ids or same position', () => {
    const list = [t('a'), t('b')]
    expect(moveTask(list, 'a', 'nope')).toBe(list)
    expect(moveTask(list, 'a', 'a')).toBe(list)
  })
})

describe('updateActivePipeline', () => {
  it('changes only the active project pipeline', () => {
    const base = addProject(defaultState(), 'Second') // Second is active
    const next = updateActivePipeline(base, (p) => [...p, t('a')])
    expect(next.projects[next.activeProjectId].pipeline).toHaveLength(1)
    expect(next.projects.default.pipeline).toEqual([])
    expect(base.projects[base.activeProjectId].pipeline).toEqual([])
  })
})

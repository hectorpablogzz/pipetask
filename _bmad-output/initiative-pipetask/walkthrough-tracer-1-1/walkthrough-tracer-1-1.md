# Walkthrough: Tracer 1.1 - shell, add task, autosave

Ticket: "Tracer: shell, add task, autosave" (epic-pipetask-app)

Current block: 1

## Blocks

- [ ] Block 1 - Intent (current)
- [ ] Block 2 - Broad strokes (unvisited)
- [ ] Block 3 - Slice: Storage model and validation (unvisited)
- [ ] Block 4 - Slice: App shell and autosave (unvisited)
- [ ] Block 5 - Periphery (unvisited)

---

## Block 1 - Intent

**Problem:** `src/` was the untouched Vite starter. There was no shell, no add-task flow, and no persistence.

**Approach:** Replace the starter page with a minimal shell that adds tasks to a pipeline and autosaves to localStorage. Storage uses a project-keyed model (one default project for now) that stories 1.2-1.7 extend.

**Source:** [plan](../epic-pipetask-app/story-tracer-shell-add-task-autosave-plan.md)

**Out of scope:** project switching, edit/delete, completion, drag-drop, corner boxes, celebration, deploy.

---

## Block 2 - Broad strokes (unvisited)

Entry points, in reading order:

1. [src/storage.ts](../../../src/storage.ts) line 1: types and project-keyed `AppState`. Line 71 `loadState`, line 82 `saveState`.
2. [src/App.tsx](../../../src/App.tsx) line 5: `App` component. Line 9: save-on-change effect.
3. [src/App.css](../../../src/App.css): shell layout, with bottom padding reserved for the later corner boxes.

---

## Block 3 - Slice: Storage model and validation (unvisited)

- `AppState` is `{ activeProjectId, projects: Record<id, Project> }`.
- `Project` has `pipeline`, `backlog`, and `cancelled` arrays.
- Task state is only `'pending' | 'completed'`.
- `loadState` validates shape through `isTask` (line 37), `isProject` (line 50), and `isAppState` (line 61). `isAppState` also checks that each record key equals `project.id` and that the active project exists.
- On missing, invalid, or corrupt data, `loadState` falls back to `defaultState` (line 18).
- `saveState` swallows storage errors.
- Storage key is `pipetask:v1` (line 15).

Files: [src/storage.ts](../../../src/storage.ts)

---

## Block 4 - Slice: App shell and autosave (unvisited)

- State is initialised lazily from `loadState`.
- A `useEffect` saves on every change.
- `addTask` trims the input, ignores blank input, appends a pending task with `crypto.randomUUID()`, and clears the input.
- The pipeline renders as an ordered list with state labels.

Files: [src/App.tsx](../../../src/App.tsx)

---

## Block 5 - Periphery (unvisited)

- [src/index.css](../../../src/index.css): trimmed starter globals. Variables and dark mode are kept.
- [src/App.css](../../../src/App.css): replaced.
- Deleted unreferenced starter assets: `src/assets/*` and `public/icons.svg`.
- [src/main.tsx](../../../src/main.tsx): unchanged.

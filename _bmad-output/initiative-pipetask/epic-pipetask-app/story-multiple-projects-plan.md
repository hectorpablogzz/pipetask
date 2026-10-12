---
title: 'Multiple projects'
type: 'feature'
ticket: '2'
created: '2026-10-12'
status: 'built'
baseline_revision: 'c41ab62e7cc406088cebf6375f9672c5d131cb58'
route: 'oneshot'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: [quick]
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/initiative-pipetask/spec-pipetask/spec-pipetask.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The app has one fixed default project. CAP-9 needs several projects, each with its own pipeline, backlog and cancelled tasks, and changes in one must never alter another.

**Approach:** Use the existing project-keyed `AppState` (`src/storage.ts`). Add a pure `addProject` helper there, and in `src/App.tsx` a project switcher plus a "new project" form that set `activeProjectId`. Blank names are ignored. Autosave already persists the whole state. Verify: tasks added in project A do not appear in B, and both survive reload.

</frozen-after-approval>

## Implementation Notes

Oneshot: about 80 lines across `src/storage.ts`, `src/App.tsx`, `src/App.css`; the 1.1 storage model already supports it, so no schema change. Gated epic override: built locally before platform baseline (user, 2026-10-12).

## Review Triage Log

- low, rejected -- duplicate project names give indistinguishable options; real but cosmetic, and a fix adds a guard and error UX.
- low, rejected -- blank-name guard lives only in `createProject`; the only caller guards, so no current harm.
- false -- "no test evidence": the isolation holds by reading `addTask` and `addProject`; no test runner exists. Manual browser check remains.
- false -- `.project-name` leftovers: none remain in CSS or TSX.
- false -- no active-project indicator outside the select: the select is the indicator.

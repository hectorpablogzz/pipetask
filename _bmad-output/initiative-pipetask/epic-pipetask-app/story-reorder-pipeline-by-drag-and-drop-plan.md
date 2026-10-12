---
title: 'Reorder pipeline by drag-and-drop'
type: 'feature'
ticket: '5'
created: '2026-10-12'
status: 'built'
baseline_revision: '4fbec010f205665fc7593e1953bf9c9111a84858'
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

**Problem:** The pipeline order is fixed to insertion order. CAP-4 needs the user to change execution order by drag-and-drop, by mouse and by touch, with the new order persisted.

**Approach:** Use `@dnd-kit/core` and `@dnd-kit/sortable` (pointer events cover mouse and touch; new dependency). Each pipeline task gets a drag handle with `touch-action: none`; `onDragEnd` reorders through `updatePipeline` and autosave persists it. Buttons and inputs stay clickable. Verify: dragging a task, by mouse or touch, changes the order shown, and the order holds after reload.

</frozen-after-approval>

## Implementation Notes

Oneshot: about 50 lines in `src/App.tsx`, `src/App.css`, plus `package.json`. dnd-kit chosen over native HTML5 drag because that does not support touch, and stories 1.6/1.7 need cross-container drag. Local build before platform baseline (user, 2026-10-12).

## Review Triage Log

- false -- edit form pushed to the far right: `.edit-task { flex: 1 }` has existed since story 3 (`src/App.css`), so the form fills the row.
- medium, patched -- the dragged row had no stacking or lifted state; it now gets `position: relative`, `z-index` and reduced opacity while dragging.
- maybe-false, rejected -- brief transition jump on drop; standard dnd-kit behaviour, unconfirmed without running the app.
- low, rejected -- no keyboard sensor; accessibility is out of scope in the spec.
- low, rejected -- `SortableTask` children not re-indented; cosmetic, left for story 1.9.
- open -- touch and reload persistence not exercised in a browser; no test runner. Needs a manual check.

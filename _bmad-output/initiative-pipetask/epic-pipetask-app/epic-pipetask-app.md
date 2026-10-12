---
type: epic
title: "PipeTask app"
parent: initiative-pipetask
covers: [CAP-1, CAP-2, CAP-3, CAP-4, CAP-5, CAP-6, CAP-7, CAP-8, CAP-9]
after: [epic-platform-baseline]
assignee: ""
risk: low
---

# PipeTask app

## Description

The whole app, built on the Vite + React starter: projects with ordered pipelines, task editing, completion feedback, drag-and-drop ordering, backlog and cancelled boxes, autosave, and a celebration on finishing. The spec holds the requirements.

## Outcome

A single user manages several projects' pipelines in the browser and loses nothing on reload; the spec's success signal is the measure.

## Done when

1. CAP-1 to CAP-9 work end to end in the running app.
2. Reload restores projects, tasks, states, order, backlog, and cancelled tasks, with no manual save.
3. Backlog renders bottom-right and cancelled box bottom-left, per project.
4. Completing the last pending task shows the celebration; no earlier completion does.
5. Changes in one project never alter another.
6. `npm run build` and `npm run lint` pass, and the deployed site runs the app.

## Boundaries

The frontend only, browser-local. Not accounts, sync, extra task states, or export/import; see the spec's non-goals.

## References

- parent — _bmad-output/initiative-pipetask/initiative-pipetask.md
- spec — _bmad-output/initiative-pipetask/spec-pipetask/spec-pipetask.md, section Capabilities
- constraint — the same spec, section Constraints

## Notes

- Decision: browser-local persistence (user's decision, 2026-10-04).
- Decision: backlog and cancelled boxes are per project; cancel by dragging to the box, restore by dragging out (user confirmed, 2026-10-04).
- Decision: a completed task can revert to pending; tasks need not complete in order; cancelling works from backlog and from completed; backlog and cancelled boxes can be reordered; touch support is in scope; reduced motion and accessibility are out of scope (user, 2026-10-04).
- Decision: the backlog accepts tasks created in it and pipeline tasks dragged into it (suggestion accepted, 2026-10-04).
- Decision: story 1 defines a project-keyed storage model for stories 2 to 7; story 8 waits on 3, 4, 6 and 7 (suggestions accepted, 2026-10-04).
- Waits on epic-platform-baseline because: the tracer is verified on the deployed site.
- Open question: feedback and celebration form is the builder's choice.
- Decision: story 1 is the tracer bullet (shell, add task, autosave); it proves UI, state and persistence connect (2026-10-04).
- Decision: sequencing: 2 and 5 come before the boxes so the project model and drag pattern exist; 6 before 7 to share the box component; 8 after 4 because it needs completion (2026-10-04).

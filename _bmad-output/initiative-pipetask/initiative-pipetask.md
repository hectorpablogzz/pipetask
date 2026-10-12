---
type: initiative
title: "A task pipeline the user orders and finishes"
parent: none
covers: [CAP-1, CAP-2, CAP-3, CAP-4, CAP-5, CAP-6, CAP-7, CAP-8, CAP-9]
assignee: ""
risk: low
---

# A task pipeline the user orders and finishes

## Description

PipeTask lets a user arrange tasks as an ordered pipeline, park unscheduled ones in a backlog, set cancelled ones aside, and get rewarded as work completes. The spec owns the capabilities, constraints, and non-goals.

## Outcome

A user runs a project's pipeline from first task to last, with feedback at each completion and a celebration at the end, and finds everything intact on reload; the spec's success signal is the measure.

## Done when

1. Every capability CAP-1 to CAP-9 works in the running app.
2. Reloading the page restores all projects, tasks, states, order, backlog, and cancelled tasks.
3. A second project is fully independent of the first.
4. Completing the last pending task of a pipeline shows the celebration; it does not show earlier.

## Boundaries

One web app, browser-local, single user. Not accounts, sync, accessibility work, or extra task states; see the spec's non-goals. Tracer path: add one task to a project's pipeline, reload, see it again.

## References

- spec — _bmad-output/initiative-pipetask/spec-pipetask/spec-pipetask.md, section Capabilities
- constraint — the same spec, section Constraints, fixed box positions and autosave

## Notes

- Decision: persistence is browser-local only; no backend, accounts, or sync (user's decision, 2026-10-04).
- Decision: backlog and cancelled boxes belong to each project (user confirmed assumption, 2026-10-04).
- Decision: a task is cancelled by dragging it to the cancelled box and can be dragged back out (user confirmed assumption, 2026-10-04).
- Open question: form of the positive feedback and celebration; left to the builder.
- Decision: the product must be deployable; platform baseline epic first. Touch support is in scope; reduced motion and accessibility are out of scope (user, 2026-10-04).

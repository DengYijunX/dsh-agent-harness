# Agent Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an independently runnable React prototype with user and developer task experiences backed by a replaceable mock event adapter.

**Architecture:** A shared runtime contract and reducer normalize task events. User and developer routes select different projections from the same state. The mock adapter emits delayed events so it behaves like a future SSE/WebSocket adapter.

**Tech Stack:** React, Vite, TypeScript, Vitest, CSS modules via a single scoped stylesheet.

---

### Task 1: Runtime contracts and reducer

**Files:**
- Create: `apps/web/src/runtime/contracts.ts`
- Create: `apps/web/src/runtime/reducer.ts`
- Test: `apps/web/src/runtime/reducer.test.ts`

- [x] Write tests for creating a task, appending streamed output, completing, failing, and cancelling.
- [x] Run the focused test after dependencies were installed and confirm reducer behavior.
- [x] Implement the smallest contracts and reducer that pass the tests.
- [x] Re-run the focused test and then the full test suite.

### Task 2: Mock event adapter

**Files:**
- Create: `apps/web/src/runtime/mockAdapter.ts`
- Test: `apps/web/src/runtime/mockAdapter.test.ts`

- [x] Write a test proving the adapter emits ordered events.
- [x] Verify the initial test setup failure was dependency/config related, then run the test against the implementation.
- [x] Implement an in-memory adapter with delayed events and unsubscribe cleanup.
- [x] Run focused and full tests.

### Task 3: Web application shell

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/index.html`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/styles.css`

- [x] Add path-based views for `/app` and `/dev` without coupling pages to the adapter.
- [x] Add responsive shell, navigation, typography, status colors, focus styles, and reduced-motion handling.
- [x] Add scripts for `dev`, `build`, `test`, and `typecheck`.

### Task 4: User and developer experiences

**Files:**
- Create: `apps/web/src/components/UserWorkspace.tsx`
- Create: `apps/web/src/components/DeveloperWorkspace.tsx`
- Create: `apps/web/src/components/TaskComposer.tsx`
- Create: `apps/web/src/components/StatusPill.tsx`

- [x] Build the user task composer, live progress, streamed result, history, cancel, retry affordance, and empty states.
- [x] Build the developer task list, event timeline, event detail panel, and runtime metrics.
- [x] Keep raw tool/model fields out of user JSX.

### Task 5: Verification and record

**Files:**
- Modify: `changelog/2026-09-03-003-agent-workbench-frontend.md`

- [x] Run unit tests, typecheck, and production build.
- [x] Inspect the generated production output and record exact results.
- [x] Fix interaction issues and update the change record.

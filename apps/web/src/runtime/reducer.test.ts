import { describe, expect, it } from "vitest";
import { initialRuntimeState, runtimeReducer } from "./reducer";

describe("runtimeReducer", () => {
  it("builds a task from ordered runtime events", () => {
    let state = initialRuntimeState;
    state = runtimeReducer(state, { type: "task.created", task: { id: "task-1", prompt: "Review the project", createdAt: "2026-09-03T08:00:00.000Z" } });
    state = runtimeReducer(state, { type: "task.status_changed", taskId: "task-1", status: "running", label: "Reading project context", timestamp: "2026-09-03T08:00:01.000Z" });
    state = runtimeReducer(state, { type: "assistant.delta", taskId: "task-1", content: "I found the runtime", timestamp: "2026-09-03T08:00:02.000Z" });
    state = runtimeReducer(state, { type: "task.completed", taskId: "task-1", result: "The runtime is ready.", timestamp: "2026-09-03T08:00:03.000Z" });

    expect(state.tasks["task-1"].status).toBe("completed");
    expect(state.tasks["task-1"].streamedOutput).toBe("I found the runtime");
    expect(state.tasks["task-1"].result).toBe("The runtime is ready.");
    expect(state.tasks["task-1"].statusLabel).toBe("Completed");
  });

  it("preserves failure details and cancellation", () => {
    let state = runtimeReducer(initialRuntimeState, { type: "task.created", task: { id: "task-2", prompt: "Run checks", createdAt: "2026-09-03T08:00:00.000Z" } });
    state = runtimeReducer(state, { type: "task.failed", taskId: "task-2", code: "MOCK_TIMEOUT", message: "The simulated run timed out.", timestamp: "2026-09-03T08:00:03.000Z" });
    expect(state.tasks["task-2"].error?.code).toBe("MOCK_TIMEOUT");
    state = runtimeReducer(state, { type: "task.status_changed", taskId: "task-2", status: "cancelled", timestamp: "2026-09-03T08:00:04.000Z" });
    expect(state.tasks["task-2"].status).toBe("cancelled");
  });
});

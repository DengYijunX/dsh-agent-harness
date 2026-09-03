import type { RuntimeEvent, Task, TaskStatus } from "./contracts";

export type RuntimeState = { tasks: Record<string, Task>; order: string[] };
export const initialRuntimeState: RuntimeState = { tasks: {}, order: [] };

const labels: Record<TaskStatus, string> = {
  queued: "Queued", running: "Working", completed: "Completed", failed: "Needs attention", cancelled: "Cancelled",
};

export function runtimeReducer(state: RuntimeState, event: RuntimeEvent): RuntimeState {
  if (event.type === "task.created") {
    const task: Task = { ...event.task, status: "queued", statusLabel: labels.queued, streamedOutput: "", events: [event] };
    return { tasks: { ...state.tasks, [task.id]: task }, order: [task.id, ...state.order] };
  }
  const current = state.tasks[event.taskId];
  if (!current) return state;
  const next: Task = { ...current, events: [...current.events, event] };
  if (event.type === "task.status_changed") { next.status = event.status; next.statusLabel = event.label ?? labels[event.status]; }
  if (event.type === "assistant.delta") next.streamedOutput += event.content;
  if (event.type === "task.completed") { next.status = "completed"; next.statusLabel = labels.completed; next.result = event.result; }
  if (event.type === "task.failed") { next.status = "failed"; next.statusLabel = labels.failed; next.error = { code: event.code, message: event.message }; }
  return { ...state, tasks: { ...state.tasks, [current.id]: next } };
}

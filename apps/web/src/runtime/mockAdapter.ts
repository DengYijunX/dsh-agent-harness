import type { CreateTaskInput, EventHandler, Task, TaskRuntimeAdapter, RuntimeEvent } from "./contracts";

export class MockTaskRuntimeAdapter implements TaskRuntimeAdapter {
  private readonly tasks = new Map<string, Task>();
  private readonly handlers = new Map<string, Set<EventHandler>>();
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>[]>();
  constructor(private readonly options: { stepDelayMs?: number } = {}) {}

  async createTask(input: CreateTaskInput): Promise<Task> {
    const task: Task = { id: `task-${Date.now()}`, prompt: input.prompt, createdAt: new Date().toISOString(), status: "queued", statusLabel: "Queued", streamedOutput: "", events: [] };
    this.tasks.set(task.id, task);
    return task;
  }

  subscribe(taskId: string, handler: EventHandler): () => void {
    const set = this.handlers.get(taskId) ?? new Set<EventHandler>();
    set.add(handler); this.handlers.set(taskId, set);
    const task = this.tasks.get(taskId);
    if (task) this.schedule(task);
    return () => { set.delete(handler); this.clear(taskId); };
  }

  async cancelTask(taskId: string): Promise<void> {
    this.clear(taskId);
    this.emit({ type: "task.status_changed", taskId, status: "cancelled", timestamp: new Date().toISOString() });
  }

  private schedule(task: Task) {
    if (this.timers.has(task.id)) return;
    const delay = this.options.stepDelayMs ?? 520;
    const events: RuntimeEvent[] = [
      { type: "task.created", task: { id: task.id, prompt: task.prompt, createdAt: task.createdAt } },
      { type: "task.status_changed", taskId: task.id, status: "running", label: "Reading project context", timestamp: new Date().toISOString() },
      { type: "assistant.delta", taskId: task.id, content: "I’m mapping the request to the project context. ", timestamp: new Date().toISOString() },
      { type: "tool.started", taskId: task.id, toolName: "readonly_file", timestamp: new Date().toISOString() },
      { type: "tool.completed", taskId: task.id, toolName: "readonly_file", durationMs: 842, timestamp: new Date().toISOString() },
      { type: "assistant.delta", taskId: task.id, content: "The key path is clear. I’ve prepared a concise next step based on the available evidence.", timestamp: new Date().toISOString() },
      { type: "task.completed", taskId: task.id, result: "The request is ready for the next implementation step. The frontend is intentionally separated from runtime internals so the real adapter can be connected later.", timestamp: new Date().toISOString() },
    ];
    const timers = events.map((event, index) => setTimeout(() => this.emit(event), index * delay));
    this.timers.set(task.id, timers);
  }
  private emit(event: RuntimeEvent) { const id = event.type === "task.created" ? event.task.id : event.taskId; this.handlers.get(id)?.forEach((handler) => handler(event)); }
  private clear(taskId: string) { this.timers.get(taskId)?.forEach(clearTimeout); this.timers.delete(taskId); }
}

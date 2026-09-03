export type TaskStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export type Task = {
  id: string;
  prompt: string;
  createdAt: string;
  status: TaskStatus;
  statusLabel: string;
  streamedOutput: string;
  result?: string;
  error?: { code: string; message: string };
  events: RuntimeEvent[];
};

export type RuntimeEvent =
  | { type: "task.created"; task: Pick<Task, "id" | "prompt" | "createdAt"> }
  | { type: "task.status_changed"; taskId: string; status: TaskStatus; label?: string; timestamp: string }
  | { type: "assistant.delta"; taskId: string; content: string; timestamp: string }
  | { type: "tool.started"; taskId: string; toolName: string; timestamp: string }
  | { type: "tool.completed"; taskId: string; toolName: string; durationMs: number; timestamp: string }
  | { type: "task.completed"; taskId: string; result: string; timestamp: string }
  | { type: "task.failed"; taskId: string; code: string; message: string; timestamp: string };

export type CreateTaskInput = { prompt: string };
export type EventHandler = (event: RuntimeEvent) => void;

export interface TaskRuntimeAdapter {
  createTask(input: CreateTaskInput): Promise<Task>;
  subscribe(taskId: string, handler: EventHandler): () => void;
  cancelTask(taskId: string): Promise<void>;
}

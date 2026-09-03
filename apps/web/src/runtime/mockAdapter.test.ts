import { describe, expect, it } from "vitest";
import { MockTaskRuntimeAdapter } from "./mockAdapter";

describe("MockTaskRuntimeAdapter", () => {
  it("emits an ordered task lifecycle and can be cancelled", async () => {
    const adapter = new MockTaskRuntimeAdapter({ stepDelayMs: 0 });
    const task = await adapter.createTask({ prompt: "Summarize the architecture" });
    const events: string[] = [];
    const done = new Promise<void>((resolve) => {
      adapter.subscribe(task.id, (event) => {
        events.push(event.type);
        if (event.type === "task.completed") resolve();
      });
    });
    await done;
    expect(events).toEqual(["task.created", "task.status_changed", "assistant.delta", "tool.started", "tool.completed", "assistant.delta", "task.completed"]);
  });
});

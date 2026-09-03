import type { AgentEvent, SessionStore } from '../core/types.ts'

export class MemorySession implements SessionStore {
  private readonly events: AgentEvent[] = []

  public async append(event: AgentEvent): Promise<void> {
    this.events.push(event)
  }

  public async read(): Promise<AgentEvent[]> {
    return this.events.map((event) => structuredClone(event))
  }
}

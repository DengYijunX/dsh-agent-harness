import type { ModelAdapter, ModelEvent, ModelRequest } from '../core/types.ts'

export class FakeModel implements ModelAdapter {
  public readonly requests: ModelRequest[] = []

  public constructor(private readonly scriptedEvents: ModelEvent[]) {}

  public async *stream(request: ModelRequest, signal: AbortSignal): AsyncIterable<ModelEvent> {
    this.requests.push(request)
    const events: ModelEvent[] = []

    while (this.scriptedEvents.length > 0) {
      if (signal.aborted) throw new Error('Aborted')
      const event = this.scriptedEvents.shift()
      if (!event) break
      events.push(event)
      if (event.type === 'turn_end') break
    }

    for (const event of events) {
      if (signal.aborted) throw new Error('Aborted')
      yield event
    }
  }
}

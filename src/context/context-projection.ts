import type { AgentEvent, ModelMessage } from '../core/types.ts'

interface ContextProjectionOptions {
  maxToolResultLength?: number
}

export class ContextProjection {
  private readonly maxToolResultLength: number

  public constructor(options: ContextProjectionOptions = {}) {
    this.maxToolResultLength = options.maxToolResultLength ?? 16_000
  }

  public project(events: AgentEvent[]): ModelMessage[] {
    const messages: ModelMessage[] = []
    for (const event of events) {
      if (event.type === 'user_message') messages.push({ role: 'user', content: event.content })
      if (event.type === 'assistant_message') messages.push({ role: 'assistant', content: event.content })
      if (event.type === 'tool_call') messages.push({ role: 'assistant', content: '', tool_calls: [{ id: event.id, name: event.name, arguments: event.arguments }] })
      if (event.type === 'tool_result') messages.push({ role: 'tool', content: truncate(event.content, this.maxToolResultLength), tool_call_id: event.id })
    }
    return messages
  }
}

function truncate(content: string, maxLength: number): string {
  return content.length > maxLength ? `${content.slice(0, maxLength)}… [output truncated]` : content
}

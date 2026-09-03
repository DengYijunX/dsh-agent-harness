import type { AgentEvent, ModelMessage } from '../core/types.ts'

interface ContextProjectionOptions {
  maxToolResultLength?: number
  maxMessages?: number
  summary?: string
}

export class ContextProjection {
  private readonly maxToolResultLength: number
  private readonly maxMessages: number | undefined
  private readonly summary: string | undefined

  public constructor(options: ContextProjectionOptions = {}) {
    this.maxToolResultLength = options.maxToolResultLength ?? 16_000
    this.maxMessages = options.maxMessages
    this.summary = options.summary
  }

  public project(events: AgentEvent[]): ModelMessage[] {
    const messages: ModelMessage[] = []
    for (const event of events) {
      if (event.type === 'user_message') messages.push({ role: 'user', content: event.content })
      if (event.type === 'assistant_message') messages.push({ role: 'assistant', content: event.content })
      if (event.type === 'tool_call') messages.push({ role: 'assistant', content: '', tool_calls: [{ id: event.id, name: event.name, arguments: event.arguments }] })
      if (event.type === 'tool_result') messages.push({ role: 'tool', content: truncate(event.content, this.maxToolResultLength), tool_call_id: event.id })
    }
    if (this.maxMessages === undefined || messages.length <= this.maxMessages) return messages
    const recent = messages.slice(-this.maxMessages)
    return this.summary ? [{ role: 'system', content: this.summary }, ...recent] : recent
  }
}

function truncate(content: string, maxLength: number): string {
  return content.length > maxLength ? `${content.slice(0, maxLength)}… [output truncated]` : content
}

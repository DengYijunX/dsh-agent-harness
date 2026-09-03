import type { AgentTool, ModelAdapter, ModelEvent, ModelRequest } from '../core/types.ts'

interface DeepSeekModelOptions {
  apiKey: string
  model?: string
  baseUrl?: string
  fetchImpl?: typeof fetch
}

interface ToolCallAccumulator {
  id: string
  name: string
  arguments: string
}

export class DeepSeekModel implements ModelAdapter {
  private readonly apiKey: string
  private readonly model: string
  private readonly baseUrl: string
  private readonly fetchImpl: typeof fetch

  public constructor(options: DeepSeekModelOptions) {
    this.apiKey = options.apiKey
    this.model = options.model ?? 'deepseek-chat'
    this.baseUrl = (options.baseUrl ?? 'https://api.deepseek.com').replace(/\/$/, '')
    this.fetchImpl = options.fetchImpl ?? fetch
  }

  public async *stream(request: ModelRequest, signal: AbortSignal): AsyncIterable<ModelEvent> {
    const response = await this.fetchImpl(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: request.messages.map(toOpenAIMessage),
        tools: request.tools.map(toOpenAITool),
        stream: true,
      }),
      signal,
    })

    if (!response.ok) {
      const message = await response.text()
      throw new Error(`DeepSeek request failed (${response.status}): ${message}`)
    }
    if (!response.body) throw new Error('DeepSeek response did not include a body')

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let finished = false
    const calls = new Map<number, ToolCallAccumulator>()

    const emitPendingCalls = (): ModelEvent[] => {
      const events: ModelEvent[] = []
      for (const call of calls.values()) {
        let args: Record<string, unknown>
        try {
          args = JSON.parse(call.arguments || '{}') as Record<string, unknown>
        } catch {
          args = { raw: call.arguments }
        }
        events.push({ type: 'tool_call', id: call.id, name: call.name, arguments: args })
      }
      calls.clear()
      return events
    }

    const processLine = (line: string): ModelEvent[] => {
      if (!line.startsWith('data:')) return []
      const payload = line.slice(5).trim()
      if (payload === '[DONE]') {
        if (finished) return []
        finished = true
        return [...emitPendingCalls(), { type: 'turn_end' }]
      }

      const chunk = JSON.parse(payload) as {
        choices?: Array<{
          delta?: { content?: string; tool_calls?: Array<{
            index?: number
            id?: string
            function?: { name?: string; arguments?: string }
          }> }
          finish_reason?: string | null
        }>
      }
      const choice = chunk.choices?.[0]
      if (!choice) return []
      const events: ModelEvent[] = []
      if (choice.delta?.content) events.push({ type: 'text_delta', text: choice.delta.content })
      for (const delta of choice.delta?.tool_calls ?? []) {
        const index = delta.index ?? 0
        const current = calls.get(index) ?? { id: '', name: '', arguments: '' }
        current.id += delta.id ?? ''
        current.name += delta.function?.name ?? ''
        current.arguments += delta.function?.arguments ?? ''
        calls.set(index, current)
      }
      if (choice.finish_reason) {
        finished = true
        events.push(...emitPendingCalls(), { type: 'turn_end' })
      }
      return events
    }

    while (!finished) {
      const { done, value } = await reader.read()
      buffer += decoder.decode(value, { stream: !done })
      let newline = buffer.indexOf('\n')
      while (newline >= 0) {
        const line = buffer.slice(0, newline).replace(/\r$/, '')
        buffer = buffer.slice(newline + 1)
        for (const event of processLine(line)) yield event
        newline = buffer.indexOf('\n')
      }
      if (done) break
    }
    if (!finished && buffer.trim()) {
      for (const event of processLine(buffer.trim())) yield event
    }
  }
}

function toOpenAITool(tool: AgentTool) {
  return {
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }
}

function toOpenAIMessage(message: ModelRequest['messages'][number]) {
  if (message.role === 'assistant' && message.tool_calls) {
    return {
      role: 'assistant',
      content: message.content,
      tool_calls: message.tool_calls.map((call) => ({
        id: call.id,
        type: 'function',
        function: {
          name: call.name,
          arguments: JSON.stringify(call.arguments),
        },
      })),
    }
  }
  return message
}

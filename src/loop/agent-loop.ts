import type {
  AgentEvent,
  AgentTool,
  ModelAdapter,
  ModelMessage,
  ModelRequest,
  SessionStore,
  ToolResult,
} from '../core/types.ts'

interface RunAgentTurnOptions {
  model: ModelAdapter
  session: SessionStore
  tools: AgentTool[]
  input: string
  signal?: AbortSignal
}

export interface AgentTurnResult {
  text: string
  events: AgentEvent[]
}

export async function runAgentTurn(options: RunAgentTurnOptions): Promise<AgentTurnResult> {
  const signal = options.signal ?? new AbortController().signal
  await options.session.append({ type: 'user_message', content: options.input })
  const textParts: string[] = []
  const tools = new Map(options.tools.map((tool) => [tool.name, tool]))

  while (true) {
    const history = await options.session.read()
    const request: ModelRequest = {
      messages: history.flatMap<ModelMessage>((event) => {
        if (event.type === 'user_message') return [{ role: 'user' as const, content: event.content }]
        if (event.type === 'assistant_message') return [{ role: 'assistant' as const, content: event.content }]
        if (event.type === 'tool_call') {
          return [{ role: 'assistant' as const, content: '', tool_calls: [{ id: event.id, name: event.name, arguments: event.arguments }] }]
        }
        if (event.type === 'tool_result') return [{ role: 'tool' as const, content: event.content, tool_call_id: event.id }]
        return []
      }),
      tools: options.tools,
    }
    let usedTool = false

    for await (const event of options.model.stream(request, signal)) {
      if (event.type === 'text_delta') textParts.push(event.text)
      if (event.type === 'tool_call') {
        usedTool = true
        const call = { id: event.id, name: event.name, arguments: event.arguments }
        await options.session.append({ type: 'tool_call', ...call })
        const tool = tools.get(call.name)
        const result: ToolResult = tool
          ? await tool.execute(call, signal)
          : { id: call.id, name: call.name, content: `unknown tool: ${call.name}`, isError: true }
        await options.session.append({ type: 'tool_result', ...result })
      }
    }

    if (usedTool) continue
    const text = textParts.join('')
    await options.session.append({ type: 'assistant_message', content: text })
    await options.session.append({ type: 'turn_end' })
    return { text, events: await options.session.read() }
  }
}

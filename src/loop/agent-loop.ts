import type {
  AgentEvent,
  AgentTool,
  ModelAdapter,
  ModelRequest,
  ToolCall,
  ToolResult,
  SessionStore,
  PermissionPolicy,
} from '../core/types.ts'
import { ToolRegistry } from '../tools/tool-registry.ts'
import { ContextProjection } from '../context/context-projection.ts'

interface RunAgentTurnOptions {
  model: ModelAdapter
  session: SessionStore
  tools: AgentTool[]
  input: string
  signal?: AbortSignal
  registry?: ToolRegistry
  permission?: PermissionPolicy
  context?: ContextProjection
}

export interface AgentTurnResult {
  text: string
  events: AgentEvent[]
}

async function executeToolCalls(registry: ToolRegistry, calls: ToolCall[], signal: AbortSignal): Promise<ToolResult[]> {
  const results: ToolResult[] = []
  let parallelCalls: ToolCall[] = []

  const flushParallel = async (): Promise<void> => {
    if (parallelCalls.length === 0) return
    results.push(...await Promise.all(parallelCalls.map((call) => registry.execute(call, signal))))
    parallelCalls = []
  }

  for (const call of calls) {
    const executionMode = registry.get(call.name)?.executionMode
    if (executionMode === 'sequential' || executionMode === 'exclusive') {
      await flushParallel()
      results.push(await registry.execute(call, signal))
    } else {
      parallelCalls.push(call)
    }
  }
  await flushParallel()
  return results
}

export async function runAgentTurn(options: RunAgentTurnOptions): Promise<AgentTurnResult> {
  const signal = options.signal ?? new AbortController().signal
  await options.session.append({ type: 'user_message', content: options.input })
  const textParts: string[] = []
  const registry = options.registry ?? new ToolRegistry(options.tools, options.permission ?? { check: async () => ({ allowed: true }) })
  const context = options.context ?? new ContextProjection()

  while (true) {
    const history = await options.session.read()
    const request: ModelRequest = {
      messages: context.project(history),
      tools: options.tools,
    }
    let usedTool = false
    const toolCalls: ToolCall[] = []

    for await (const event of options.model.stream(request, signal)) {
      if (event.type === 'text_delta') textParts.push(event.text)
      if (event.type === 'tool_call') {
        usedTool = true
        const call = { id: event.id, name: event.name, arguments: event.arguments }
        await options.session.append({ type: 'tool_call', ...call })
        toolCalls.push(call)
      }
    }

    if (usedTool) {
      const results = await executeToolCalls(registry, toolCalls, signal)
      for (const result of results) await options.session.append({ type: 'tool_result', ...result })
      continue
    }
    const text = textParts.join('')
    await options.session.append({ type: 'assistant_message', content: text })
    await options.session.append({ type: 'turn_end' })
    return { text, events: await options.session.read() }
  }
}

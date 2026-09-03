export interface UserMessage {
  role: 'user'
  content: string
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ModelRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'tool'; content: string }>
  tools: AgentTool[]
}

export type ModelEvent =
  | { type: 'text_delta'; text: string }
  | { type: 'tool_call'; id: string; name: string; arguments: Record<string, unknown> }
  | { type: 'turn_end' }

export interface ModelAdapter {
  stream(request: ModelRequest, signal: AbortSignal): AsyncIterable<ModelEvent>
}

export interface ToolResult {
  id: string
  name: string
  content: string
  isError?: boolean
}

export interface AgentTool {
  name: string
  description: string
  parameters: unknown
  executionMode?: 'parallel' | 'sequential'
  execute(call: ToolCall, signal: AbortSignal): Promise<ToolResult>
}

export type AgentEvent =
  | { type: 'user_message'; content: string }
  | ({ type: 'tool_call' } & ToolCall)
  | ({ type: 'tool_result' } & ToolResult)
  | { type: 'assistant_message'; content: string }
  | { type: 'turn_end' }

export interface SessionStore {
  append(event: AgentEvent): Promise<void>
  read(): Promise<AgentEvent[]>
}

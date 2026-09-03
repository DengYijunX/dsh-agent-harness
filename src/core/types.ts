export interface UserMessage {
  role: 'user'
  content: string
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export type ModelMessage =
  | { role: 'system' | 'user' | 'assistant'; content: string; tool_calls?: ToolCall[] }
  | { role: 'tool'; content: string; tool_call_id: string }

export interface ModelRequest {
  messages: ModelMessage[]
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
  executionMode?: 'parallel' | 'sequential' | 'exclusive'
  execute(call: ToolCall, signal: AbortSignal): Promise<ToolResult>
}

export interface PermissionDecision {
  allowed: boolean
  reason?: string
}

export interface PermissionPolicy {
  check(call: ToolCall, tool: AgentTool): Promise<PermissionDecision>
}

export interface ApprovalSurface {
  request(call: ToolCall, tool: AgentTool): Promise<PermissionDecision>
}

export interface ApprovalStore {
  get(toolName: string): Promise<PermissionDecision | undefined>
  set(toolName: string, decision: PermissionDecision): Promise<void>
}

export interface AuditEvent {
  type: 'audit'
  category: 'tool' | 'permission' | 'sandbox'
  name: string
  data: Record<string, unknown>
}

export interface AuditSink {
  emit(event: AuditEvent): Promise<void>
}

export interface SandboxExecutor {
  execute(command: string, options: Record<string, unknown>, signal: AbortSignal): Promise<{ stdout: string; stderr: string; exitCode: number }>
}

export type AgentEvent =
  | { type: 'user_message'; content: string }
  | ({ type: 'tool_call' } & ToolCall)
  | ({ type: 'tool_result' } & ToolResult)
  | { type: 'assistant_message'; content: string }
  | { type: 'turn_end' }
  | AuditEvent

export interface SessionStore {
  append(event: AgentEvent): Promise<void>
  read(): Promise<AgentEvent[]>
}

export interface AgentRuntime {
  prompt(input: string): Promise<{ text: string; events: AgentEvent[] }>
  abort(): void
}

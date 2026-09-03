import type { AgentTool, AuditSink, PermissionPolicy, ToolCall, ToolResult } from '../core/types.ts'

export class ToolRegistry {
  private readonly tools: Map<string, AgentTool>
  private readonly policy: PermissionPolicy
  private readonly audit: AuditSink | undefined

  public constructor(tools: AgentTool[], policy: PermissionPolicy, audit?: AuditSink) {
    this.tools = new Map(tools.map((tool) => [tool.name, tool]))
    this.policy = policy
    this.audit = audit
  }

  public get(name: string): AgentTool | undefined {
    return this.tools.get(name)
  }

  public list(): AgentTool[] {
    return [...this.tools.values()]
  }

  public async execute(call: ToolCall, signal: AbortSignal): Promise<ToolResult> {
    await this.emit({ type: 'audit', category: 'tool', name: 'tool_requested', data: { toolName: call.name, callId: call.id } })
    const tool = this.tools.get(call.name)
    if (!tool) {
      await this.emit({ type: 'audit', category: 'tool', name: 'tool_failed', data: { toolName: call.name, callId: call.id, reason: 'unknown tool' } })
      return { id: call.id, name: call.name, content: `unknown tool: ${call.name}`, isError: true }
    }

    const decision = await this.policy.check(call, tool)
    if (!decision.allowed) {
      await this.emit({ type: 'audit', category: 'permission', name: 'permission_denied', data: { toolName: call.name, callId: call.id, reason: decision.reason ?? 'permission denied' } })
      return { id: call.id, name: call.name, content: decision.reason ?? 'permission denied', isError: true }
    }
    await this.emit({ type: 'audit', category: 'permission', name: 'permission_granted', data: { toolName: call.name, callId: call.id } })

    try {
      const result = await tool.execute(call, signal)
      await this.emit({ type: 'audit', category: result.isError ? 'tool' : 'tool', name: result.isError ? 'tool_failed' : 'tool_completed', data: { toolName: call.name, callId: call.id, ok: !result.isError } })
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await this.emit({ type: 'audit', category: 'tool', name: 'tool_failed', data: { toolName: call.name, callId: call.id, reason: message } })
      return { id: call.id, name: call.name, content: message, isError: true }
    }
  }

  private async emit(event: Parameters<AuditSink['emit']>[0]): Promise<void> {
    await this.audit?.emit(event)
  }
}

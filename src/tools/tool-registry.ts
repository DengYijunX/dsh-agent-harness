import type { AgentTool, PermissionPolicy, ToolCall, ToolResult } from '../core/types.ts'

export class ToolRegistry {
  private readonly tools: Map<string, AgentTool>
  private readonly policy: PermissionPolicy

  public constructor(tools: AgentTool[], policy: PermissionPolicy) {
    this.tools = new Map(tools.map((tool) => [tool.name, tool]))
    this.policy = policy
  }

  public get(name: string): AgentTool | undefined {
    return this.tools.get(name)
  }

  public list(): AgentTool[] {
    return [...this.tools.values()]
  }

  public async execute(call: ToolCall, signal: AbortSignal): Promise<ToolResult> {
    const tool = this.tools.get(call.name)
    if (!tool) return { id: call.id, name: call.name, content: `unknown tool: ${call.name}`, isError: true }

    const decision = await this.policy.check(call, tool)
    if (!decision.allowed) {
      return { id: call.id, name: call.name, content: decision.reason ?? 'permission denied', isError: true }
    }

    try {
      return await tool.execute(call, signal)
    } catch (error) {
      return { id: call.id, name: call.name, content: error instanceof Error ? error.message : String(error), isError: true }
    }
  }
}

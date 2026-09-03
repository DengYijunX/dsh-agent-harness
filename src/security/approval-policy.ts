import type { AgentTool, ApprovalSurface, PermissionDecision, PermissionPolicy, ToolCall } from '../core/types.ts'

export class ApprovalPolicy implements PermissionPolicy {
  private readonly surface: ApprovalSurface

  public constructor(surface: ApprovalSurface) {
    this.surface = surface
  }

  public async check(call: ToolCall, tool: AgentTool): Promise<PermissionDecision> {
    return this.surface.request(call, tool)
  }
}

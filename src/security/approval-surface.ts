import type { AgentTool, ApprovalSurface, PermissionDecision, ToolCall } from '../core/types.ts'

export type ApprovalHandler = (call: ToolCall, tool: AgentTool) => Promise<PermissionDecision> | PermissionDecision

export class CallbackApprovalSurface implements ApprovalSurface {
  private readonly handler: ApprovalHandler

  public constructor(handler: ApprovalHandler) {
    this.handler = handler
  }

  public request(call: ToolCall, tool: AgentTool): Promise<PermissionDecision> {
    return Promise.resolve(this.handler(call, tool))
  }
}

import type { AgentTool, ApprovalStore, ApprovalSurface, PermissionDecision, PermissionPolicy, ToolCall } from '../core/types.ts'

export class MemoryApprovalStore implements ApprovalStore {
  private readonly decisions = new Map<string, PermissionDecision>()

  public async get(toolName: string): Promise<PermissionDecision | undefined> {
    return this.decisions.get(toolName)
  }

  public async set(toolName: string, decision: PermissionDecision): Promise<void> {
    this.decisions.set(toolName, decision)
  }
}

export class StoredApprovalPolicy implements PermissionPolicy {
  private readonly surface: ApprovalSurface
  private readonly store: ApprovalStore

  public constructor(surface: ApprovalSurface, store: ApprovalStore) {
    this.surface = surface
    this.store = store
  }

  public async check(call: ToolCall, tool: AgentTool): Promise<PermissionDecision> {
    const remembered = await this.store.get(tool.name)
    if (remembered) return remembered
    const decision = await this.surface.request(call, tool)
    await this.store.set(tool.name, decision)
    return decision
  }
}

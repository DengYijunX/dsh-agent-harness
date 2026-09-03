import { appendFile, mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { AgentTool, ApprovalStore, ApprovalSurface, PermissionDecision, PermissionPolicy, ToolCall } from '../core/types.ts'

export type ApprovalScopeResolver = (call: ToolCall, tool: AgentTool) => string

export class MemoryApprovalStore implements ApprovalStore {
  private readonly decisions = new Map<string, PermissionDecision>()

  public async get(toolName: string): Promise<PermissionDecision | undefined> {
    return this.decisions.get(toolName)
  }

  public async set(toolName: string, decision: PermissionDecision): Promise<void> {
    this.decisions.set(toolName, decision)
  }
}

export class JsonlApprovalStore implements ApprovalStore {
  private readonly filePath: string

  public constructor(filePath: string) {
    this.filePath = filePath
  }

  public async get(toolName: string): Promise<PermissionDecision | undefined> {
    let content: string
    try {
      content = await readFile(this.filePath, 'utf8')
    } catch (error) {
      if (isMissingFile(error)) return undefined
      throw error
    }

    let latest: PermissionDecision | undefined
    for (const [index, line] of content.split(/\r?\n/).entries()) {
      if (!line.trim()) continue
      try {
        const record: unknown = JSON.parse(line)
        if (!isApprovalRecord(record) || record.toolName !== toolName) continue
        latest = record.decision
      } catch {
        throw new Error(`Invalid approval record at line ${index + 1}`)
      }
    }
    return latest
  }

  public async set(toolName: string, decision: PermissionDecision): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true })
    await appendFile(this.filePath, `${JSON.stringify({ toolName, decision })}\n`, 'utf8')
  }
}

export class StoredApprovalPolicy implements PermissionPolicy {
  private readonly surface: ApprovalSurface
  private readonly store: ApprovalStore
  private readonly resolveScope: ApprovalScopeResolver

  public constructor(surface: ApprovalSurface, store: ApprovalStore, resolveScope: ApprovalScopeResolver = defaultApprovalScope) {
    this.surface = surface
    this.store = store
    this.resolveScope = resolveScope
  }

  public async check(call: ToolCall, tool: AgentTool): Promise<PermissionDecision> {
    const scope = this.resolveScope(call, tool)
    const remembered = await this.store.get(scope)
    if (remembered) return remembered
    const decision = await this.surface.request(call, tool)
    await this.store.set(scope, decision)
    return decision
  }
}

function defaultApprovalScope(call: ToolCall, tool: AgentTool): string {
  return `${tool.name}:${JSON.stringify(call.arguments)}`
}

function isMissingFile(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT'
}

function isApprovalRecord(value: unknown): value is { toolName: string; decision: PermissionDecision } {
  return typeof value === 'object'
    && value !== null
    && 'toolName' in value
    && typeof value.toolName === 'string'
    && 'decision' in value
    && typeof value.decision === 'object'
    && value.decision !== null
    && 'allowed' in value.decision
    && typeof value.decision.allowed === 'boolean'
}

import { describe, expect, it, vi } from 'vitest'
import type { AgentTool, ApprovalSurface, ToolCall } from '../src/core/types.ts'
import { MemoryApprovalStore, StoredApprovalPolicy } from '../src/security/approval-store.ts'

const call: ToolCall = { id: 'call-1', name: 'shell', arguments: { command: 'echo safe' } }
const tool: AgentTool = { name: 'shell', description: 'shell', parameters: {}, execute: async () => ({ id: 'call-1', name: 'shell', content: 'ok' }) }

describe('StoredApprovalPolicy', () => {
  it('reuses a remembered approval without prompting again', async () => {
    const surface: ApprovalSurface = { request: vi.fn(async () => ({ allowed: true })) }
    const policy = new StoredApprovalPolicy(surface, new MemoryApprovalStore())

    await expect(policy.check(call, tool)).resolves.toEqual({ allowed: true })
    await expect(policy.check({ ...call, id: 'call-2' }, tool)).resolves.toEqual({ allowed: true })
    expect(surface.request).toHaveBeenCalledOnce()
  })
})

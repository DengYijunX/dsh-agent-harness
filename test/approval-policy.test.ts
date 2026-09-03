import { describe, expect, it } from 'vitest'
import type { AgentTool, ApprovalSurface, ToolCall } from '../src/core/types.ts'
import { ApprovalPolicy } from '../src/security/approval-policy.ts'

const call: ToolCall = { id: 'call-1', name: 'write_file', arguments: { path: 'notes.txt' } }
const tool: AgentTool = { name: 'write_file', description: 'write', parameters: {}, execute: async () => ({ id: 'call-1', name: 'write_file', content: 'ok' }) }

describe('ApprovalPolicy', () => {
  it('delegates the permission decision to the approval surface', async () => {
    const surface: ApprovalSurface = { request: async () => ({ allowed: false, reason: 'user denied' }) }
    const policy = new ApprovalPolicy(surface)

    await expect(policy.check(call, tool)).resolves.toEqual({ allowed: false, reason: 'user denied' })
  })
})

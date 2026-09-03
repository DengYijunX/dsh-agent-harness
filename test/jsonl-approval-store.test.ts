import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { AgentTool, ToolCall } from '../src/core/types.ts'
import { CallbackApprovalSurface } from '../src/security/approval-surface.ts'
import { JsonlApprovalStore, StoredApprovalPolicy } from '../src/security/approval-store.ts'

const call: ToolCall = { id: 'call-1', name: 'write_file', arguments: { path: 'notes.txt' } }
const tool: AgentTool = { name: 'write_file', description: 'write', parameters: {}, execute: async () => ({ id: 'call-1', name: 'write_file', content: 'ok' }) }

describe('JSONL approval persistence', () => {
  it('persists and reloads an approval decision', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'dsh-approval-'))
    const filePath = join(directory, 'approvals.jsonl')
    try {
      const surface = new CallbackApprovalSurface(async () => ({ allowed: true, reason: 'approved for this session' }))
      const policy = new StoredApprovalPolicy(surface, new JsonlApprovalStore(filePath))
      await expect(policy.check(call, tool)).resolves.toEqual({ allowed: true, reason: 'approved for this session' })
      await expect(new JsonlApprovalStore(filePath).get('write_file:{"path":"notes.txt"}')).resolves.toEqual({ allowed: true, reason: 'approved for this session' })
      await expect(new JsonlApprovalStore(filePath).get('shell:other')).resolves.toBeUndefined()
      await expect(readFile(filePath, 'utf8')).resolves.toContain('write_file')
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})

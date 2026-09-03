import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { HarnessPlugin } from '../src/dsh/harness-plugin.ts'
import { FakeModel } from '../src/model/fake-model.ts'
import { MemorySession } from '../src/session/memory-session.ts'
import { ReadonlyFileTool } from '../src/tools/readonly-file-tool.ts'
import type { SandboxExecutor } from '../src/core/types.ts'
import { CallbackApprovalSurface } from '../src/security/approval-surface.ts'
import { MemoryApprovalStore } from '../src/security/approval-store.ts'

describe('HarnessPlugin', () => {
  it('assembles core services and removes them with the owning fiber', async () => {
    const ctx = new Context()
    const model = new FakeModel([{ type: 'text_delta', text: 'ready' }, { type: 'turn_end' }])
    const session = new MemorySession()
    const tool = new ReadonlyFileTool({ root: import.meta.dirname })
    const fiber = await ctx.plugin(HarnessPlugin, { model, session, tools: [tool] })

    expect(ctx.get('harnessModel')).toBe(model)
    expect(ctx.get('harnessSession')).toBe(session)
    expect(ctx.get('harnessTools')).toEqual([tool])
    expect(ctx.get('harnessToolRegistry')).toBeDefined()
    expect(ctx.get('harnessRuntime')).toBeDefined()
    expect(fiber.state).toBe(2)

    await ctx.fiber.dispose()
    expect(ctx.get('harnessModel')).toBeUndefined()
    expect(ctx.get('harnessSession')).toBeUndefined()
    expect(ctx.get('harnessTools')).toBeUndefined()
    expect(ctx.get('harnessToolRegistry')).toBeUndefined()
    expect(ctx.get('harnessRuntime')).toBeUndefined()
  })

  it('selectively assembles write and shell tools behind injected governance', async () => {
    const ctx = new Context()
    const sandbox: SandboxExecutor = { execute: async () => ({ stdout: '', stderr: '', exitCode: 0 }) }
    const fiber = await ctx.plugin(HarnessPlugin, {
      model: new FakeModel([]),
      session: new MemorySession(),
      enableWriteFile: true,
      enableShell: true,
      sandbox,
      permission: { check: async () => ({ allowed: false, reason: 'approval required' }) },
    })

    expect(ctx.get('harnessTools')).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'read_file' }),
      expect.objectContaining({ name: 'write_file', executionMode: 'exclusive' }),
      expect.objectContaining({ name: 'shell', executionMode: 'exclusive' }),
    ]))
    expect(ctx.get('harnessTools')).toHaveLength(3)
    await fiber.dispose()
  })

  it('wires approval surface and store into the assembled runtime', async () => {
    const ctx = new Context()
    const session = new MemorySession()
    const fiber = await ctx.plugin(HarnessPlugin, {
      model: new FakeModel([
        { type: 'tool_call', id: 'write-1', name: 'write_file', arguments: { path: 'approval-test.txt', content: 'blocked' } },
        { type: 'text_delta', text: 'not approved' },
        { type: 'turn_end' },
      ]),
      session,
      enableWriteFile: true,
      approvalSurface: new CallbackApprovalSurface(async () => ({ allowed: false, reason: 'user denied' })),
      approvalStore: new MemoryApprovalStore(),
    })

    await ctx.get('harnessRuntime')?.prompt('Write a file.')
    expect(await session.read()).toContainEqual(expect.objectContaining({ type: 'tool_result', content: 'user denied', isError: true }))
    await fiber.dispose()
  })
})

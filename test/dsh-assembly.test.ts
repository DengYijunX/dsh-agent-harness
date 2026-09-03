import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { HarnessPlugin } from '../src/dsh/harness-plugin.ts'
import { FakeModel } from '../src/model/fake-model.ts'
import { MemorySession } from '../src/session/memory-session.ts'
import { ReadonlyFileTool } from '../src/tools/readonly-file-tool.ts'

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
    expect(ctx.get('harnessRuntime')).toBeDefined()
    expect(fiber.state).toBe(2)

    await ctx.fiber.dispose()
    expect(ctx.get('harnessModel')).toBeUndefined()
    expect(ctx.get('harnessSession')).toBeUndefined()
    expect(ctx.get('harnessTools')).toBeUndefined()
    expect(ctx.get('harnessRuntime')).toBeUndefined()
  })
})

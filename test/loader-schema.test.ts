import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { createHarnessContext, HarnessConfigSchema, type HarnessConfig } from '../src/dsh/bootstrap.ts'
import { FakeModel } from '../src/model/fake-model.ts'
import { MemorySession } from '../src/session/memory-session.ts'
import { ReadonlyFileTool } from '../src/tools/readonly-file-tool.ts'

describe('Harness bootstrap configuration', () => {
  it('validates configuration before mounting the runtime', () => {
    expect(() => HarnessConfigSchema({ sessionPath: 42 } as unknown as HarnessConfig)).toThrow()
    expect(HarnessConfigSchema({ sessionPath: 'sessions/test.jsonl' })).toMatchObject({
      sessionPath: 'sessions/test.jsonl',
    })
  })

  it('starts Loader before the Harness services', async () => {
    const model = new FakeModel([{ type: 'text_delta', text: 'ok' }, { type: 'turn_end' }])
    const session = new MemorySession()
    const tool = new ReadonlyFileTool({ root: import.meta.dirname })
    const ctx = await createHarnessContext({ model, session, tools: [tool] })

    expect(ctx.get('loader')).toBeDefined()
    expect(ctx.get('harnessRuntime')).toBeDefined()
    await ctx.fiber.dispose()
  })
})

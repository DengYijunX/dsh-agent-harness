import { describe, expect, it } from 'vitest'
import { runAgentTurn } from '../src/loop/agent-loop.ts'
import { FakeModel } from '../src/model/fake-model.ts'
import { MemorySession } from '../src/session/memory-session.ts'
import { ReadonlyFileTool } from '../src/tools/readonly-file-tool.ts'
import { ToolRegistry } from '../src/tools/tool-registry.ts'

describe('minimum real-chain contract', () => {
  it('executes a readonly file tool and persists the complete turn', async () => {
    const session = new MemorySession()
    const model = new FakeModel([
      {
        type: 'tool_call',
        id: 'call-1',
        name: 'read_file',
        arguments: { path: 'notes.txt' },
      },
      { type: 'text_delta', text: 'The file contains the requested note.' },
      { type: 'turn_end' },
    ])
    const tool = new ReadonlyFileTool({
      root: import.meta.dirname,
      files: new Map([['notes.txt', 'priority: high']]),
    })

    const result = await runAgentTurn({
      model,
      session,
      tools: [tool],
      input: 'Read notes.txt and summarize it.',
    })

    expect(result.text).toBe('The file contains the requested note.')
    expect(model.requests[1]?.messages).toEqual([
      { role: 'user', content: 'Read notes.txt and summarize it.' },
      {
        role: 'assistant',
        content: '',
        tool_calls: [{ id: 'call-1', name: 'read_file', arguments: { path: 'notes.txt' } }],
      },
      { role: 'tool', content: 'priority: high', tool_call_id: 'call-1' },
    ])
    expect(await session.read()).toEqual([
      { type: 'user_message', content: 'Read notes.txt and summarize it.' },
      {
        type: 'tool_call',
        id: 'call-1',
        name: 'read_file',
        arguments: { path: 'notes.txt' },
      },
      { type: 'tool_result', id: 'call-1', name: 'read_file', content: 'priority: high' },
      { type: 'assistant_message', content: 'The file contains the requested note.' },
      { type: 'turn_end' },
    ])
  })

  it('rejects paths outside the configured root', async () => {
    const tool = new ReadonlyFileTool({ root: import.meta.dirname })
    const result = await tool.execute({
      id: 'call-escape',
      name: 'read_file',
      arguments: { path: '../outside.txt' },
    }, new AbortController().signal)

    expect(result).toMatchObject({
      id: 'call-escape',
      isError: true,
      content: 'path escapes the configured root',
    })
  })

  it('persists a permission denial as a tool result', async () => {
    const session = new MemorySession()
    const model = new FakeModel([
      { type: 'tool_call', id: 'call-denied', name: 'read_file', arguments: { path: 'notes.txt' } },
      { type: 'text_delta', text: 'I cannot access that file.' },
      { type: 'turn_end' },
    ])
    const tool = new ReadonlyFileTool({ root: import.meta.dirname, files: new Map([['notes.txt', 'secret']]) })
    const registry = new ToolRegistry([tool], { check: async () => ({ allowed: false, reason: 'approval required' }) })

    await runAgentTurn({ model, session, tools: [tool], registry, input: 'Read notes.txt.' })

    expect(await session.read()).toContainEqual({
      type: 'tool_result',
      id: 'call-denied',
      name: 'read_file',
      content: 'approval required',
      isError: true,
    })
  })
})

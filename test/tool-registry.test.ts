import { describe, expect, it, vi } from 'vitest'
import type { AgentTool, ToolCall, ToolResult } from '../src/core/types.ts'
import { ToolRegistry } from '../src/tools/tool-registry.ts'

const call: ToolCall = { id: 'call-1', name: 'read_file', arguments: { path: 'README.md' } }

function tool(result = 'content'): AgentTool {
  return {
    name: 'read_file',
    description: 'read',
    parameters: {},
    execute: vi.fn(async (input) => ({ id: input.id, name: input.name, content: result })),
  }
}

describe('ToolRegistry', () => {
  it('executes a registered tool after permission approval', async () => {
    const registered = tool()
    const registry = new ToolRegistry([registered], { check: async () => ({ allowed: true }) })

    await expect(registry.execute(call, new AbortController().signal)).resolves.toEqual({
      id: 'call-1', name: 'read_file', content: 'content',
    })
    expect(registered.execute).toHaveBeenCalledOnce()
  })

  it('returns a denial result without executing the tool', async () => {
    const registered = tool()
    const registry = new ToolRegistry([registered], { check: async () => ({ allowed: false, reason: 'approval required' }) })

    await expect(registry.execute(call, new AbortController().signal)).resolves.toEqual({
      id: 'call-1', name: 'read_file', content: 'approval required', isError: true,
    })
    expect(registered.execute).not.toHaveBeenCalled()
  })

  it('returns an error result for an unknown tool', async () => {
    const registry = new ToolRegistry([], { check: async () => ({ allowed: true }) })
    const result: ToolResult = await registry.execute(call, new AbortController().signal)

    expect(result).toEqual({ id: 'call-1', name: 'read_file', content: 'unknown tool: read_file', isError: true })
  })

  it('emits structured audit events around permission and execution', async () => {
    const events: Array<{ type: string; name: string; data: Record<string, unknown> }> = []
    const registry = new ToolRegistry([tool()], { check: async () => ({ allowed: true }) }, {
      emit: async (event) => { events.push(event) },
    })

    await registry.execute(call, new AbortController().signal)

    expect(events.map((event) => event.name)).toEqual(['tool_requested', 'permission_granted', 'tool_completed'])
    expect(events[2]?.data).toMatchObject({ toolName: 'read_file', ok: true })
  })
})

import { describe, expect, it } from 'vitest'
import type { AgentEvent } from '../src/core/types.ts'
import { ContextProjection } from '../src/context/context-projection.ts'

describe('ContextProjection', () => {
  it('omits audit events and truncates oversized tool results', () => {
    const events: AgentEvent[] = [
      { type: 'user_message', content: 'inspect files' },
      { type: 'audit', category: 'tool', name: 'tool_requested', data: { toolName: 'read_file' } },
      { type: 'tool_call', id: 'call-1', name: 'read_file', arguments: { path: 'large.txt' } },
      { type: 'tool_result', id: 'call-1', name: 'read_file', content: '123456789' },
      { type: 'assistant_message', content: 'summary' },
    ]

    expect(new ContextProjection({ maxToolResultLength: 5 }).project(events)).toEqual([
      { role: 'user', content: 'inspect files' },
      { role: 'assistant', content: '', tool_calls: [{ id: 'call-1', name: 'read_file', arguments: { path: 'large.txt' } }] },
      { role: 'tool', content: '12345… [output truncated]', tool_call_id: 'call-1' },
      { role: 'assistant', content: 'summary' },
    ])
  })

  it('keeps a bounded recent context and prepends a historical summary', () => {
    const events: AgentEvent[] = [
      { type: 'user_message', content: 'old question' },
      { type: 'assistant_message', content: 'old answer' },
      { type: 'user_message', content: 'current question' },
    ]

    expect(new ContextProjection({ maxMessages: 2, summary: 'Earlier task was completed.' }).project(events)).toEqual([
      { role: 'system', content: 'Earlier task was completed.' },
      { role: 'assistant', content: 'old answer' },
      { role: 'user', content: 'current question' },
    ])
  })
})

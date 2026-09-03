import { describe, expect, it } from 'vitest'
import { DeepSeekModel } from '../src/model/deepseek-model.ts'

describe('DeepSeekModel', () => {
  it('converts streaming text and tool-call deltas into harness events', async () => {
    const response = new Response([
      'data: {"choices":[{"delta":{"content":"Hello "}}]}',
      'data: {"choices":[{"delta":{"content":"world"}}]}',
      'data: {"choices":[{"delta":{"tool_calls":[{"index":0,"id":"call-1","function":{"name":"read_file","arguments":"{\\"path\\":\\"notes.txt\\"}"}}]}}]}',
      'data: {"choices":[{"finish_reason":"tool_calls","delta":{}}]}',
      'data: [DONE]',
      '',
    ].join('\n'))
    const model = new DeepSeekModel({
      apiKey: 'test-key',
      model: 'deepseek-chat',
      fetchImpl: async () => response,
    })

    const events = []
    for await (const event of model.stream({ messages: [{ role: 'user', content: 'Read notes.' }], tools: [] }, new AbortController().signal)) {
      events.push(event)
    }

    expect(events).toEqual([
      { type: 'text_delta', text: 'Hello ' },
      { type: 'text_delta', text: 'world' },
      { type: 'tool_call', id: 'call-1', name: 'read_file', arguments: { path: 'notes.txt' } },
      { type: 'turn_end' },
    ])
  })

  it('raises an actionable error for a failed HTTP response', async () => {
    const model = new DeepSeekModel({
      apiKey: 'test-key',
      fetchImpl: async () => new Response('bad request', { status: 400 }),
    })

    await expect(async () => {
      for await (const _event of model.stream({ messages: [], tools: [] }, new AbortController().signal)) {
        // consume the stream
      }
    }).rejects.toThrow('DeepSeek request failed (400): bad request')
  })
})

import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import type { AgentEvent } from '../src/core/types.ts'
import { JsonlSession } from '../src/session/jsonl-session.ts'

describe('JsonlSession', () => {
  it('appends events and restores them in order', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'harness-session-'))
    const file = path.join(directory, 'session.jsonl')
    const first = new JsonlSession(file)
    const events: AgentEvent[] = [
      { type: 'user_message', content: 'find TODOs' },
      { type: 'assistant_message', content: 'I found three.' },
      { type: 'turn_end' },
    ]

    for (const event of events) await first.append(event)
    const restored = new JsonlSession(file)

    await expect(restored.read()).resolves.toEqual(events)
    await expect(readFile(file, 'utf8')).resolves.toBe(`${events.map((event) => JSON.stringify(event)).join('\n')}\n`)
    await rm(directory, { recursive: true, force: true })
  })

  it('reports the line number of a corrupt event', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'harness-session-'))
    const file = path.join(directory, 'broken.jsonl')
    const session = new JsonlSession(file)
    await session.append({ type: 'user_message', content: 'hello' })
    await import('node:fs/promises').then(({ appendFile }) => appendFile(file, '{broken json}\n'))

    await expect(session.read()).rejects.toThrow('Invalid session event at line 2')
    await rm(directory, { recursive: true, force: true })
  })
})

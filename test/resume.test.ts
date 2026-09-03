import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runAgentTurn } from '../src/loop/agent-loop.ts'
import { FakeModel } from '../src/model/fake-model.ts'
import { JsonlSession } from '../src/session/jsonl-session.ts'

describe('Session Resume', () => {
  it('recreates a session and continues with its prior context', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'dsh-resume-'))
    const filePath = join(directory, 'session.jsonl')
    try {
      const firstSession = new JsonlSession(filePath)
      await runAgentTurn({ model: new FakeModel([{ type: 'text_delta', text: 'first answer' }, { type: 'turn_end' }]), session: firstSession, tools: [], input: 'first question' })

      const secondModel = new FakeModel([{ type: 'text_delta', text: 'continued answer' }, { type: 'turn_end' }])
      await runAgentTurn({ model: secondModel, session: new JsonlSession(filePath), tools: [], input: 'continue' })

      expect(secondModel.requests[0]?.messages).toEqual([
        { role: 'user', content: 'first question' },
        { role: 'assistant', content: 'first answer' },
        { role: 'user', content: 'continue' },
      ])
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })
})

import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runAgentTurn } from '../src/loop/agent-loop.ts'
import { DeepSeekModel } from '../src/model/deepseek-model.ts'
import { JsonlSession } from '../src/session/jsonl-session.ts'
import { WriteFileTool } from '../src/tools/write-file-tool.ts'
import { ToolRegistry } from '../src/tools/tool-registry.ts'

const env = loadDotEnv()
const apiKey = process.env.DEEPSEEK_API_KEY ?? env.DEEPSEEK_API_KEY
const modelName = process.env.DEEPSEEK_MODEL ?? env.DEEPSEEK_MODEL ?? 'deepseek-chat'
const baseUrl = process.env.DEEPSEEK_BASE_URL ?? env.DEEPSEEK_BASE_URL

describe.skipIf(!apiKey)('real DeepSeek governance', () => {
  it('rejects a real model write request before touching the filesystem', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'dsh-real-governance-'))
    const sessionPath = join(directory, 'session.jsonl')
    try {
      const tool = new WriteFileTool({ root: directory })
      const session = new JsonlSession(sessionPath)
      const registry = new ToolRegistry([tool], {
        check: async () => ({ allowed: false, reason: 'approval required' }),
      }, { emit: async (event) => session.append(event) })

      await runAgentTurn({
        model: new DeepSeekModel({ apiKey: apiKey as string, model: modelName, ...(baseUrl ? { baseUrl } : {}) }),
        session,
        tools: [tool],
        registry,
        input: '请务必调用 write_file，把“blocked”写入 blocked.txt。',
      })

      const events = await session.read()
      expect(events.some((event) => event.type === 'tool_call' && event.name === 'write_file')).toBe(true)
      expect(events).toContainEqual(expect.objectContaining({ type: 'tool_result', name: 'write_file', content: 'approval required', isError: true }))
      await expect(readFile(join(directory, 'blocked.txt'), 'utf8')).rejects.toThrow()
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  }, 120_000)
})

function loadDotEnv(): Record<string, string> {
  try {
    return Object.fromEntries(readFileSync('.env', 'utf8').split(/\r?\n/).flatMap((line) => {
      const match = line.match(/^\s*([^#=\s]+)\s*=\s*(.*?)\s*$/)
      const key = match?.[1]
      const value = match?.[2]
      return key && value !== undefined ? [[key, value.replace(/^(['"])(.*)\1$/, '$2')] as const] : []
    }))
  } catch {
    return {}
  }
}

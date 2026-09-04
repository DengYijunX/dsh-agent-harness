import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runAgentTurn } from '../src/loop/agent-loop.ts'
import { DeepSeekModel } from '../src/model/deepseek-model.ts'
import { JsonlSession } from '../src/session/jsonl-session.ts'
import { ReadonlyFileTool } from '../src/tools/readonly-file-tool.ts'

const dotEnv = loadDotEnv()
const apiKey = process.env.DEEPSEEK_API_KEY ?? dotEnv.DEEPSEEK_API_KEY
const modelName = process.env.DEEPSEEK_MODEL ?? dotEnv.DEEPSEEK_MODEL ?? 'deepseek-chat'
const baseUrl = process.env.DEEPSEEK_BASE_URL ?? dotEnv.DEEPSEEK_BASE_URL

describe.skipIf(!apiKey)('real DeepSeek chain', () => {
  it('connects DeepSeek, real file IO, Agent Loop and JSONL Session', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'dsh-real-chain-'))
    const workspace = join(directory, 'workspace')
    const inputFile = join(workspace, 'todo.txt')
    const sessionFile = join(directory, 'session.jsonl')
    try {
      await mkdir(workspace, { recursive: true })
      await writeFile(inputFile, 'TODO: add a regression test\nTODO: document the release process\n', 'utf8')
      const result = await runAgentTurn({
        model: new DeepSeekModel({ apiKey: apiKey as string, model: modelName, ...(baseUrl ? { baseUrl } : {}) }),
        session: new JsonlSession(sessionFile),
        tools: [new ReadonlyFileTool({ root: workspace })],
        input: '请调用 read_file 读取 todo.txt，然后用中文总结其中的 TODO。',
      })

      expect(result.text.length).toBeGreaterThan(0)
      const events = await new JsonlSession(sessionFile).read()
      expect(events.some((event) => event.type === 'tool_result')).toBe(true)
      await expect(readFile(sessionFile, 'utf8')).resolves.toContain('tool_result')
      if (process.env.KEEP_REAL_CHAIN_ARTIFACTS) {
        console.log(`Real chain artifacts: ${directory}`)
        console.log(JSON.stringify(events, null, 2))
      }
    } finally {
      if (!process.env.KEEP_REAL_CHAIN_ARTIFACTS) await rm(directory, { recursive: true, force: true })
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

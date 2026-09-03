import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { runAgentTurn } from '../src/loop/agent-loop.ts'
import { DeepSeekModel } from '../src/model/deepseek-model.ts'
import { JsonlSession } from '../src/session/jsonl-session.ts'
import { ReadonlyFileTool } from '../src/tools/readonly-file-tool.ts'

const apiKey = process.env.DEEPSEEK_API_KEY

describe.skipIf(!apiKey)('real DeepSeek chain', () => {
  it('connects DeepSeek, real file IO, Agent Loop and JSONL Session', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'dsh-real-chain-'))
    const workspace = join(directory, 'workspace')
    const inputFile = join(workspace, 'todo.txt')
    const sessionFile = join(directory, 'session.jsonl')
    try {
      await writeFile(inputFile, 'TODO: add a regression test\nTODO: document the release process\n', 'utf8')
      const result = await runAgentTurn({
        model: new DeepSeekModel({ apiKey: apiKey as string, model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat' }),
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

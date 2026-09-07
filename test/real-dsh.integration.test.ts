import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { createHarnessContext } from '../src/dsh/bootstrap.ts'
import { JsonlSession } from '../src/session/jsonl-session.ts'
import { ReadonlyFileTool } from '../src/tools/readonly-file-tool.ts'

const env = loadDotEnv()
const apiKey = process.env.DEEPSEEK_API_KEY ?? env.DEEPSEEK_API_KEY
const modelName = process.env.DEEPSEEK_MODEL ?? env.DEEPSEEK_MODEL ?? 'deepseek-chat'
const baseUrl = process.env.DEEPSEEK_BASE_URL ?? env.DEEPSEEK_BASE_URL

describe.skipIf(!apiKey)('real DSH assembly', () => {
  it('assembles DSH services and runs a real DeepSeek tool turn', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'dsh-real-assembly-'))
    const workspace = join(directory, 'workspace')
    const sessionPath = join(directory, 'session.jsonl')
    try {
      await mkdir(workspace, { recursive: true })
      await writeFile(join(workspace, 'facts.txt'), '事实：项目使用 TypeScript。\n', 'utf8')
      const ctx = await createHarnessContext({ apiKey: apiKey as string, modelName, ...(baseUrl ? { baseUrl } : {}), sessionPath, workspaceRoot: workspace })
      try {
        const result = await ctx.get('harnessRuntime')?.prompt('请调用 read_file 读取 facts.txt，然后复述事实。')
        expect(result?.text.length).toBeGreaterThan(0)
        expect(ctx.get('harnessModel')).toBeDefined()
        expect(ctx.get('harnessToolRegistry')).toBeDefined()
        await expect(readFile(sessionPath, 'utf8')).resolves.toContain('tool_result')
      } finally {
        await ctx.fiber.dispose()
      }
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

import { describe, expect, it } from 'vitest'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHarnessContextFromFile } from '../src/dsh/bootstrap.ts'

describe('Include YAML bootstrap', () => {
  it('loads the Harness Plugin through the DSH entry-list format', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'harness-config-'))
    const configPath = path.join(directory, 'harness.yml')
    const pluginUrl = pathToFileURL(path.join(process.cwd(), 'src/dsh/harness-plugin.ts')).href
    await writeFile(configPath, [
      '- id: harness',
      `  name: ${pluginUrl}`,
      '  config:',
      '    modelName: deepseek-chat',
      '    sessionPath: sessions/include-test.jsonl',
      `    workspaceRoot: ${process.cwd().replaceAll('\\', '/')}`,
    ].join('\n'))

    const ctx = await createHarnessContextFromFile(configPath)
    expect(ctx.get('loader')).toBeDefined()
    expect(ctx.get('harnessRuntime')).toBeDefined()

    await ctx.fiber.dispose()
    await rm(directory, { recursive: true, force: true })
  })

  it('fails before publishing services when the YAML file is missing', async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), 'harness-config-'))
    const missingPath = path.join(directory, 'missing.yml')

    await expect(createHarnessContextFromFile(missingPath)).rejects.toThrow()
    await rm(directory, { recursive: true, force: true })
  })
})

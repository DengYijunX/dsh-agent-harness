import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('package metadata', () => {
  it('declares a build output and public CLI command', async () => {
    const packageJson = JSON.parse(await readFile(path.join(process.cwd(), 'package.json'), 'utf8')) as {
      private?: boolean
      name?: string
      bin?: Record<string, string>
      files?: string[]
      scripts?: Record<string, string>
    }
    expect(packageJson.name).toBe('dsh-agent-harness')
    expect(packageJson.private).toBe(false)
    expect(packageJson.bin?.['dsh-agent-harness']).toBe('./dist/cli.js')
    expect(packageJson.files).toEqual(expect.arrayContaining(['dist', 'harness.yml', 'vendor']))
    expect(packageJson.scripts?.build).toBeDefined()
    expect(packageJson.scripts?.['release:check']).toBeDefined()
  })
})

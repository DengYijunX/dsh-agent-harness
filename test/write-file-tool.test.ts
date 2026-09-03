import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { WriteFileTool } from '../src/tools/write-file-tool.ts'

describe('WriteFileTool', () => {
  it('writes only inside its configured workspace root', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dsh-harness-'))
    try {
      const tool = new WriteFileTool({ root })
      await expect(tool.execute({ id: 'write-1', name: 'write_file', arguments: { path: 'notes.txt', content: 'hello' } }, new AbortController().signal)).resolves.toMatchObject({ content: 'wrote notes.txt' })
      await expect(readFile(join(root, 'notes.txt'), 'utf8')).resolves.toBe('hello')
      await expect(tool.execute({ id: 'write-2', name: 'write_file', arguments: { path: '../escape.txt', content: 'nope' } }, new AbortController().signal)).resolves.toMatchObject({ isError: true, content: 'path escapes the configured root' })
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})

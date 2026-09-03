import { describe, expect, it, vi } from 'vitest'
import type { SandboxExecutor } from '../src/core/types.ts'
import { ShellTool } from '../src/tools/shell-tool.ts'

describe('ShellTool', () => {
  it('uses the sandbox executor and truncates oversized output', async () => {
    const sandbox: SandboxExecutor = { execute: vi.fn(async () => ({ stdout: '123456789', stderr: '', exitCode: 0 })) }
    const tool = new ShellTool({ sandbox, maxOutputLength: 5 })

    await expect(tool.execute({ id: 'shell-1', name: 'shell', arguments: { command: 'echo safe' } }, new AbortController().signal)).resolves.toEqual({
      id: 'shell-1', name: 'shell', content: '12345… [output truncated]',
    })
    expect(sandbox.execute).toHaveBeenCalledWith('echo safe', {}, expect.any(AbortSignal))
    expect(tool.executionMode).toBe('exclusive')
  })
})

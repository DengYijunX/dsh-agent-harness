import { describe, expect, it } from 'vitest'
import { LocalSandboxExecutor } from '../src/security/local-sandbox.ts'

describe('LocalSandboxExecutor', () => {
  it('terminates a command that exceeds its timeout', async () => {
    const sandbox = new LocalSandboxExecutor(process.cwd(), { timeoutMs: 20 })
    await expect(sandbox.execute('node -e "setTimeout(() => {}, 1000)"', {}, new AbortController().signal)).rejects.toThrow('Sandbox timeout')
  })

  it('terminates a running command when aborted', async () => {
    const sandbox = new LocalSandboxExecutor(process.cwd())
    const controller = new AbortController()
    const execution = sandbox.execute('node -e "setTimeout(() => {}, 1000)"', {}, controller.signal)
    controller.abort()
    await expect(execution).rejects.toThrow('Aborted')
  })
})

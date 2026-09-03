import { spawn } from 'node:child_process'
import path from 'node:path'
import type { SandboxExecutor } from '../core/types.ts'

interface LocalSandboxOptions {
  timeoutMs?: number
  env?: Record<string, string>
}

export class LocalSandboxExecutor implements SandboxExecutor {
  private readonly root: string
  private readonly options: LocalSandboxOptions

  public constructor(root: string, options: LocalSandboxOptions = {}) {
    this.root = path.resolve(root)
    this.options = options
  }

  public execute(command: string, options: Record<string, unknown>, signal: AbortSignal): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const child = spawn(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', command], {
        cwd: this.root,
        env: { PATH: process.env.PATH ?? '', SystemRoot: process.env.SystemRoot ?? 'C:\\Windows', ...this.options.env },
        windowsHide: true,
      })
      let stdout = ''
      let stderr = ''
      child.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString('utf8') })
      child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString('utf8') })
      let settled = false
      const settleError = (error: Error): void => {
        if (settled) return
        settled = true
        child.kill()
        reject(error)
      }
      const abort = (): void => settleError(new Error('Aborted'))
      if (signal.aborted) return abort()
      signal.addEventListener('abort', abort, { once: true })
      const timer = this.options.timeoutMs === undefined ? undefined : setTimeout(() => settleError(new Error('Sandbox timeout')), this.options.timeoutMs)
      child.on('error', (error) => settleError(error))
      child.on('close', (exitCode) => {
        if (settled) return
        settled = true
        if (timer) clearTimeout(timer)
        signal.removeEventListener('abort', abort)
        resolve({ stdout, stderr, exitCode: exitCode ?? 1 })
      })
      void options
    })
  }
}

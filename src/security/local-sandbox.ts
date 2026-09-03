import { spawn } from 'node:child_process'
import path from 'node:path'
import type { SandboxExecutor } from '../core/types.ts'

export class LocalSandboxExecutor implements SandboxExecutor {
  private readonly root: string

  public constructor(root: string) {
    this.root = path.resolve(root)
  }

  public execute(command: string, options: Record<string, unknown>, signal: AbortSignal): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const child = spawn(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', command], {
        cwd: this.root,
        env: { PATH: process.env.PATH ?? '', SystemRoot: process.env.SystemRoot ?? 'C:\\Windows' },
        windowsHide: true,
      })
      let stdout = ''
      let stderr = ''
      child.stdout.on('data', (chunk: Buffer) => { stdout += chunk.toString('utf8') })
      child.stderr.on('data', (chunk: Buffer) => { stderr += chunk.toString('utf8') })
      const abort = (): void => { child.kill(); reject(new Error('Aborted')) }
      if (signal.aborted) return abort()
      signal.addEventListener('abort', abort, { once: true })
      child.on('error', reject)
      child.on('close', (exitCode) => {
        signal.removeEventListener('abort', abort)
        resolve({ stdout, stderr, exitCode: exitCode ?? 1 })
      })
      void options
    })
  }
}

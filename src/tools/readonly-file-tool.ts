import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { AgentTool, ToolCall, ToolResult } from '../core/types.ts'

interface ReadonlyFileToolOptions {
  root: string
  files?: Map<string, string>
  maxBytes?: number
}

export class ReadonlyFileTool implements AgentTool {
  public readonly name = 'read_file'
  public readonly description = 'Read a UTF-8 text file inside the configured project root.'
  public readonly parameters = { type: 'object', required: ['path'] }
  public readonly executionMode = 'parallel' as const

  public constructor(private readonly options: ReadonlyFileToolOptions) {}

  public async execute(call: ToolCall, signal: AbortSignal): Promise<ToolResult> {
    const requestedPath = call.arguments.path
    if (typeof requestedPath !== 'string' || requestedPath.length === 0) {
      return { id: call.id, name: call.name, content: 'path must be a non-empty string', isError: true }
    }
    if (signal.aborted) throw new Error('Aborted')

    const relativePath = path.normalize(requestedPath)
    const absolutePath = path.resolve(this.options.root, relativePath)
    const root = path.resolve(this.options.root)
    if (absolutePath !== root && !absolutePath.startsWith(`${root}${path.sep}`)) {
      return { id: call.id, name: call.name, content: 'path escapes the configured root', isError: true }
    }

    const virtualContent = this.options.files?.get(relativePath)
    const content = virtualContent ?? await fs.readFile(absolutePath, 'utf8')
    const maxBytes = this.options.maxBytes ?? 16_000
    const truncated = Buffer.byteLength(content, 'utf8') > maxBytes
      ? `${content.slice(0, maxBytes)}\n[output truncated]`
      : content
    return { id: call.id, name: call.name, content: truncated }
  }
}

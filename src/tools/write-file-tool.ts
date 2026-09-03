import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { AgentTool, ToolCall, ToolResult } from '../core/types.ts'

interface WriteFileToolOptions {
  root: string
}

export class WriteFileTool implements AgentTool {
  public readonly name = 'write_file'
  public readonly description = 'Write UTF-8 text to a file inside the configured project root.'
  public readonly parameters = {
    type: 'object',
    properties: { path: { type: 'string' }, content: { type: 'string' } },
    required: ['path', 'content'],
    additionalProperties: false,
  }
  public readonly executionMode = 'exclusive' as const
  private readonly options: WriteFileToolOptions

  public constructor(options: WriteFileToolOptions) {
    this.options = options
  }

  public async execute(call: ToolCall, signal: AbortSignal): Promise<ToolResult> {
    const requestedPath = call.arguments.path
    const content = call.arguments.content
    if (typeof requestedPath !== 'string' || requestedPath.length === 0) return { id: call.id, name: call.name, content: 'path must be a non-empty string', isError: true }
    if (typeof content !== 'string') return { id: call.id, name: call.name, content: 'content must be a string', isError: true }
    if (signal.aborted) throw new Error('Aborted')

    const relativePath = path.normalize(requestedPath)
    const root = path.resolve(this.options.root)
    const absolutePath = path.resolve(root, relativePath)
    if (absolutePath === root || !absolutePath.startsWith(`${root}${path.sep}`)) return { id: call.id, name: call.name, content: 'path escapes the configured root', isError: true }

    await fs.mkdir(path.dirname(absolutePath), { recursive: true })
    await fs.writeFile(absolutePath, content, 'utf8')
    return { id: call.id, name: call.name, content: `wrote ${relativePath}` }
  }
}

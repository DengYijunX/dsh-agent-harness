import type { AgentTool, SandboxExecutor, ToolCall, ToolResult } from '../core/types.ts'

interface ShellToolOptions {
  sandbox: SandboxExecutor
  maxOutputLength?: number
}

export class ShellTool implements AgentTool {
  public readonly name = 'shell'
  public readonly description = 'Run an approved command through the configured sandbox executor.'
  public readonly parameters = {
    type: 'object',
    properties: { command: { type: 'string' } },
    required: ['command'],
    additionalProperties: false,
  }
  public readonly executionMode = 'exclusive' as const
  private readonly options: ShellToolOptions

  public constructor(options: ShellToolOptions) {
    this.options = options
  }

  public async execute(call: ToolCall, signal: AbortSignal): Promise<ToolResult> {
    const command = call.arguments.command
    if (typeof command !== 'string' || command.trim().length === 0) return { id: call.id, name: call.name, content: 'command must be a non-empty string', isError: true }
    const result = await this.options.sandbox.execute(command, {}, signal)
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n') || `(exit code ${result.exitCode})`
    const maxLength = this.options.maxOutputLength ?? 16_000
    const content = output.length > maxLength ? `${output.slice(0, maxLength)}… [output truncated]` : output
    return { id: call.id, name: call.name, content, ...(result.exitCode === 0 ? {} : { isError: true }) }
  }
}

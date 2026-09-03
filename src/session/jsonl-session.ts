import { appendFile, mkdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type { AgentEvent, SessionStore } from '../core/types.ts'

export class JsonlSession implements SessionStore {
  private readonly filePath: string

  public constructor(filePath: string) {
    this.filePath = filePath
  }

  public async append(event: AgentEvent): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true })
    await appendFile(this.filePath, `${JSON.stringify(event)}\n`, 'utf8')
  }

  public async read(): Promise<AgentEvent[]> {
    let content: string
    try {
      content = await readFile(this.filePath, 'utf8')
    } catch (error) {
      if (isMissingFile(error)) return []
      throw error
    }

    const events: AgentEvent[] = []
    for (const [index, line] of content.split(/\r?\n/).entries()) {
      if (!line.trim()) continue
      try {
        const event: unknown = JSON.parse(line)
        if (!isAgentEvent(event)) throw new Error('invalid event shape')
        events.push(event)
      } catch {
        throw new Error(`Invalid session event at line ${index + 1}`)
      }
    }
    return events
  }
}

function isMissingFile(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT'
}

function isAgentEvent(value: unknown): value is AgentEvent {
  return typeof value === 'object'
    && value !== null
    && 'type' in value
    && typeof value.type === 'string'
}

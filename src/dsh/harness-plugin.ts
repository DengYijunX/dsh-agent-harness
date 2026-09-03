import type { Context } from '@deepseek-ai/cordis'
import type { AgentEvent, AgentRuntime, AgentTool, ModelAdapter, PermissionPolicy, SessionStore } from '../core/types.ts'
import { runAgentTurn } from '../loop/agent-loop.ts'
import { DeepSeekModel } from '../model/deepseek-model.ts'
import { JsonlSession } from '../session/jsonl-session.ts'
import { ReadonlyFileTool } from '../tools/readonly-file-tool.ts'
import { ToolRegistry } from '../tools/tool-registry.ts'

export interface HarnessPluginConfig {
  model?: ModelAdapter
  session?: SessionStore
  tools?: AgentTool[]
  registry?: ToolRegistry
  permission?: PermissionPolicy
  apiKey?: string
  modelName?: string
  baseUrl?: string
  sessionPath?: string
  workspaceRoot?: string
}

class HarnessRuntime implements AgentRuntime {
  private activeController: AbortController | undefined
  private readonly model: ModelAdapter
  private readonly session: SessionStore
  private readonly tools: AgentTool[]
  private readonly registry: ToolRegistry

  public constructor(
    model: ModelAdapter,
    session: SessionStore,
    tools: AgentTool[],
    registry: ToolRegistry,
  ) {
    this.model = model
    this.session = session
    this.tools = tools
    this.registry = registry
  }

  public async prompt(input: string): Promise<{ text: string; events: AgentEvent[] }> {
    const controller = new AbortController()
    this.activeController = controller
    try {
      return await runAgentTurn({ model: this.model, session: this.session, tools: this.tools, registry: this.registry, input, signal: controller.signal })
    } finally {
      if (this.activeController === controller) this.activeController = undefined
    }
  }

  public abort(): void {
    this.activeController?.abort()
  }
}

export function HarnessPlugin(ctx: Context, config: HarnessPluginConfig = {}): void {
  const deepSeekOptions: { apiKey: string; model?: string; baseUrl?: string } = {
    apiKey: config.apiKey ?? process.env.DEEPSEEK_API_KEY ?? '',
  }
  const modelName = config.modelName ?? process.env.DEEPSEEK_MODEL
  const baseUrl = config.baseUrl ?? process.env.DEEPSEEK_BASE_URL
  if (modelName) deepSeekOptions.model = modelName
  if (baseUrl) deepSeekOptions.baseUrl = baseUrl
  const model = config.model ?? new DeepSeekModel(deepSeekOptions)
  const session = config.session ?? new JsonlSession(config.sessionPath ?? 'sessions/default.jsonl')
  const tools = config.tools ?? [new ReadonlyFileTool({ root: config.workspaceRoot ?? process.cwd() })]
  const registry = config.registry ?? new ToolRegistry(tools, config.permission ?? { check: async () => ({ allowed: true }) })
  const runtime = new HarnessRuntime(model, session, tools, registry)

  ctx.provide('harnessModel', model)
  ctx.provide('harnessSession', session)
  ctx.provide('harnessTools', tools)
  ctx.provide('harnessToolRegistry', registry)
  ctx.provide('harnessRuntime', runtime)
  ctx.effect(() => () => runtime.abort(), 'harness.runtime')
}

export default HarnessPlugin

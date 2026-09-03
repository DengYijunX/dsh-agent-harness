import { Context } from '@deepseek-ai/cordis'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Schema from '@deepseek-ai/schemastery'
import type { HarnessPluginConfig } from './harness-plugin.ts'
import { HarnessPlugin } from './harness-plugin.ts'

export interface HarnessConfig {
  modelName?: string
  baseUrl?: string
  sessionPath?: string
  workspaceRoot?: string
}

export const HarnessConfigSchema = Schema.object({
  modelName: Schema.string().default('deepseek-chat'),
  baseUrl: Schema.string(),
  sessionPath: Schema.string().default('sessions/default.jsonl'),
  workspaceRoot: Schema.string().default(process.cwd()),
})

export async function createHarnessContext(options: HarnessPluginConfig = {}): Promise<Context> {
  const rawConfig: Record<string, string> = {}
  if (options.modelName) rawConfig.modelName = options.modelName
  if (options.baseUrl) rawConfig.baseUrl = options.baseUrl
  if (options.sessionPath) rawConfig.sessionPath = options.sessionPath
  if (options.workspaceRoot) rawConfig.workspaceRoot = options.workspaceRoot
  const config = HarnessConfigSchema(rawConfig)

  const ctx = new Context()
  try {
    const loaderFiber = ctx.plugin(Loader, {})
    await loaderFiber.await()
    const harnessFiber = ctx.plugin(HarnessPlugin, { ...options, ...config })
    await harnessFiber.await()
    return ctx
  } catch (error) {
    await ctx.fiber.dispose()
    throw error
  }
}

import { Context } from '@deepseek-ai/cordis'
import Include from '@deepseek-ai/cordis-plugin-include'
import Loader from '@deepseek-ai/cordis-plugin-loader'
import Schema from '@deepseek-ai/schemastery'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { HarnessPluginConfig } from './harness-plugin.ts'
import { HarnessPlugin } from './harness-plugin.ts'

export interface HarnessConfig {
  modelName?: string
  baseUrl?: string
  sessionPath?: string
  workspaceRoot?: string
  enableWriteFile?: boolean
  enableShell?: boolean
}

export const HarnessConfigSchema = Schema.object({
  modelName: Schema.string().default('deepseek-chat'),
  baseUrl: Schema.string(),
  sessionPath: Schema.string().default('sessions/default.jsonl'),
  workspaceRoot: Schema.string().default(process.cwd()),
  enableWriteFile: Schema.boolean().default(false),
  enableShell: Schema.boolean().default(false),
})

export async function createHarnessContext(options: HarnessPluginConfig = {}): Promise<Context> {
  const rawConfig: Record<string, string | boolean> = {}
  if (options.modelName) rawConfig.modelName = options.modelName
  if (options.baseUrl) rawConfig.baseUrl = options.baseUrl
  if (options.sessionPath) rawConfig.sessionPath = options.sessionPath
  if (options.workspaceRoot) rawConfig.workspaceRoot = options.workspaceRoot
  if (options.enableWriteFile !== undefined) rawConfig.enableWriteFile = options.enableWriteFile
  if (options.enableShell !== undefined) rawConfig.enableShell = options.enableShell
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

export async function createHarnessContextFromFile(configPath: string): Promise<Context> {
  const ctx = new Context()
  ctx.baseUrl = `${pathToFileURL(path.dirname(configPath)).href}/`
  try {
    await ctx.plugin(Loader, {}).await()
    await ctx.plugin(Include, {
      path: pathToFileURL(configPath).href,
      enableLogs: false,
    }).await()
    await ctx.get('loader')?.await()
    return ctx
  } catch (error) {
    await ctx.fiber.dispose()
    throw error
  }
}

import path from 'node:path'
import { pathToFileURL } from 'node:url'
import type { AgentRuntime } from './core/types.ts'
import { createHarnessContextFromFile } from './dsh/bootstrap.ts'

export interface CliOptions {
  configPath: string
  prompt: string
  help: boolean
}

export function parseCliArgs(args: string[]): CliOptions {
  let configPath = 'harness.yml'
  let prompt = ''
  let help = false
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--help' || arg === '-h') help = true
    else if (arg === '--config') {
      configPath = args[++index] ?? ''
      if (!configPath) throw new Error('--config requires a path')
    } else if (arg === '--prompt') {
      prompt = args[++index] ?? ''
      if (!prompt) throw new Error('--prompt requires text')
    } else throw new Error(`Unknown option: ${arg}`)
  }
  return { configPath, prompt, help }
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  const options = parseCliArgs(args)
  if (options.help) {
    console.log('Usage: npm start -- [--config harness.yml] --prompt "your request"')
    return
  }
  if (!options.prompt) throw new Error('--prompt is required')

  const ctx = await createHarnessContextFromFile(path.resolve(options.configPath))
  try {
    const runtime = ctx.get('harnessRuntime') as AgentRuntime | undefined
    if (!runtime) throw new Error('harnessRuntime service is unavailable')
    const result = await runtime.prompt(options.prompt)
    console.log(result.text)
  } finally {
    await ctx.fiber.dispose()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}

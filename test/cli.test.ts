import { describe, expect, it } from 'vitest'
import { parseCliArgs } from '../src/cli.ts'

describe('CLI arguments', () => {
  it('parses config and prompt options', () => {
    expect(parseCliArgs(['--config', 'custom.yml', '--prompt', 'read README'])).toEqual({
      configPath: 'custom.yml',
      prompt: 'read README',
      help: false,
    })
  })

  it('supports help and rejects unknown options', () => {
    expect(parseCliArgs(['--help']).help).toBe(true)
    expect(() => parseCliArgs(['--unknown'])).toThrow('Unknown option: --unknown')
  })
})

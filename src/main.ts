import { cac } from 'cac'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig, normalizeConfig } from './config'
import { deploy } from './deploy'
import { PrettyError } from './errors'

const name = 'sshdp'

type CommandOptions = { config: string }

export async function main() {
  const cli = cac(name)

  // deploy
  cli
    .command('[dir]', 'Deploy your release build')
    .option('-c, --config <file>', 'Use specific config file')
    .action(async (dir: string, options: CommandOptions) => {
      dir = dir || 'dist'

      if (!existsSync(dir)) {
        throw new PrettyError(`Dist dir '${dir}' not existed`)
      }

      if (!existsSync(options.config)) {
        throw new PrettyError('Config file not found')
      }

      const configOptions = await loadConfig(options.config)
      const deployOptions = normalizeConfig(configOptions)

      await deploy(dir, deployOptions)
    })

  cli.help()

  const pkgPath = join(dirname(fileURLToPath(import.meta.url)), '../package.json')
  cli.version(JSON.parse(readFileSync(pkgPath, 'utf-8')).version)

  cli.parse(process.argv, { run: false })
  await cli.runMatchedCommand()
}

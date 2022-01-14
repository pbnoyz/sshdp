import { bundleRequire } from 'bundle-require'
import path, { isAbsolute, parse } from 'path'
import { SetRequired, Simplify } from 'type-fest'
import { PrettyError } from './errors'

/**
 * Options of config file for deploy task
 */
export interface ConfigOptions {
  /**
   * SSH server host
   */
  host: string

  /**
   * SSH server port
   *
   * @default 22
   */
  port?: number

  /**
   * Username to log in
   *
   * @default root
   */
  username?: string

  /**
   * User password. Leave empty if use private key.
   */
  password?: string

  /**
   * Private key file path
   */
  keyFile?: string

  /**
   * Absolute path of destination
   */
  deployPath: string

  /**
   * Releases folder name
   *
   * @default releases
   */
  releasesFolder?: string

  /**
   * Number of backups to keep
   *
   * @default 1
   */
  releasesToKeep?: number

  /**
   * Command to execute after deploy
   */
  afterDeployTask?: string

  /**
   * Delete the temporary archive file
   *
   * @default false
   */
  deleteTempArchive?: boolean
}

interface ExtraOptions {
  parentDir: string
  linkName: string
  releasesPath: string
}

export type NormalizedOptions = Simplify<
  SetRequired<
    ConfigOptions,
    'port' | 'username' | 'releasesToKeep' | 'releasesFolder'
  > &
    ExtraOptions
>

const defaultConfig: NormalizedOptions = {
  host: '',
  port: 22,
  username: 'root',
  deployPath: '',
  releasesFolder: 'releases',
  releasesToKeep: 1,
  deleteTempArchive: false,
  parentDir: '',
  linkName: '',
  releasesPath: '',
} as const

export async function loadConfig(path: string) {
  const { mod } = await bundleRequire({
    filepath: path,
  })

  if (mod['default']) {
    return mod['default'] as ConfigOptions
  }

  throw new PrettyError(
    'Load config failed. Please make sure default export the config'
  )
}

export function normalizeConfig(options: ConfigOptions) {
  validateConfig(options)

  const { dir, base } = parse(options.deployPath)
  const resolved: NormalizedOptions = {
    ...defaultConfig,
    ...options,
    parentDir: dir,
    linkName: base,
  }
  resolved.releasesPath = path.posix.join(dir, resolved.releasesFolder)
  return resolved
}

function validateConfig(options: ConfigOptions) {
  if (!isAbsolute(options.deployPath)) {
    throw new PrettyError(`${options.deployPath} is not an absolute path name`)
  }
}

export const defineConfig = (config: ConfigOptions) => config

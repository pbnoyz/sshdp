import * as colors from 'colorette'
import { readFileSync, rmSync } from 'node:fs'
import path from 'node:path'
import type SSHConfig from 'ssh2-promise/lib/sshConfig'
import type { NormalizedOptions } from './config'
import { createLogger } from './log'
import { createSession, SSHSession } from './session'
import { localDateTimeString, zip } from './utils'

const logger = createLogger()

export async function deploy(dir: string, options: NormalizedOptions) {
  const session = await connect(options)

  try {
    await prepare(session, options)
    await upload(dir, session, options)
    await finalWork(session, options)

    logger.success('done!')
  } catch (error) {
    if (error instanceof Buffer) {
      // ? cannot figure out whether it is actually an error
      console.log(error.toString())
    } else {
      throw error
    }
  } finally {
    await session.close()
  }
}

async function connect(options: NormalizedOptions) {
  const { host, port, username, keyFile, password } = options

  const sshConfig: SSHConfig = {
    host,
    port,
    username,
  }

  if (keyFile) {
    sshConfig.privateKey = readFileSync(keyFile)
  } else {
    sshConfig.password = password
  }

  const session = createSession(sshConfig)

  logger.info(
    'ssh',
    `🌐 Connect to remote machine at ${colors.underline(`${host}:${port}`)}`
  )

  await session.open()
  const who = await session.exec('whoami')

  logger.success('ssh', `🔑 Logged in as ${colors.bold(who)}`)

  return session
}

async function prepare(session: SSHSession, options: NormalizedOptions) {
  const { deployPath, releasesPath } = options

  // backup old files
  await session.backupOldFiles(deployPath)
  await session.createFolder(releasesPath)
}

async function upload(
  dir: string,
  session: SSHSession,
  options: NormalizedOptions
) {
  const { host, port, deployPath, linkName, releasesPath, deleteTempArchive } =
    options

  // Make an archive
  logger.info('zip', '📁 Compress the dist dir to a zip file')

  const releaseName = `${linkName}_${localDateTimeString()}`
  const localArchivePath = await zip(dir, releaseName)

  logger.success('zip', `📦 Created ${colors.underline(localArchivePath)}`)

  // Upload
  const remoteArchivePath = path.posix.join(releasesPath, 'dist.zip')
  const target = path.posix.join(releasesPath, releaseName)

  logger.info(
    'ssh',
    `✈️ Upload the archive file to ${colors.underline(
      `${host}:${port}:${remoteArchivePath}`
    )}`
  )

  await session.upload(localArchivePath, remoteArchivePath)
  await session.unzip(remoteArchivePath, releasesPath + '/')

  logger.success(
    'ssh',
    `📂 Uploaded and decompressed to ${colors.blue(target)}`
  )

  // Update the symlink
  await session.createSymlink(target, deployPath)

  logger.success(
    'ssh',
    `🔗 Created symlink: ${colors.cyan(deployPath)} -> ${colors.blue(target)}`
  )

  // Delete the archive
  if (deleteTempArchive) {
    logger.info('zip', '🗑️ Delete the temporary archive')

    rmSync(localArchivePath)
  }
}

async function finalWork(session: SSHSession, options: NormalizedOptions) {
  const { releasesPath, releasesToKeep, afterDeployTask } = options

  await session.removeOldFolders(releasesPath, releasesToKeep)

  if (afterDeployTask) {
    logger.info('ssh', `⌨️ Execute command '${colors.bold(afterDeployTask)}'`)

    await session.exec(afterDeployTask)
  }
}

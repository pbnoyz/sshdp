import SSH2Promise from 'ssh2-promise'
import type SSHConfig from 'ssh2-promise/lib/sshConfig'

export type SSHSession = ReturnType<typeof createSession>

type StepCallback = (transferrd: number, chunk: number, total: number) => void

export const createSession = (config: SSHConfig) => ({
  ssh: new SSH2Promise(config),

  async open() {
    await this.ssh.connect()
  },

  async close() {
    await this.ssh.close()
  },

  async exec(command: string) {
    return await this.ssh.exec(command)
  },

  async execBatch(commands: string[]) {
    for (const command of commands) {
      await this.exec(command)
    }
  },

  async createSymlink(target: string, link: string) {
    await this.execBatch([
      `mkdir -p \`dirname ${link}\``,
      `ln -sfn -T ${target} ${link}`,
    ])
  },

  async backupOldFiles(path: string) {
    const result = (await this.exec(`file ${path}`)) as string

    if (result.includes('directory') && !result.includes('cannot open')) {
      await this.exec(`mv -f ${path} ${path}.old`)
    }
  },

  async createFolder(path: string) {
    await this.exec(`mkdir -p ${path}`)
  },

  async removeOldFolders(dir: string, countToKeep: number) {
    await this.exec(
      `cd ${dir} && rm -rf \`ls -r ${dir} | awk 'NR>${countToKeep}'\``
    )
  },

  async unzip(archivePath: string, dest: string) {
    await this.execBatch([
      `unzip -q ${archivePath} -d ${dest}`,
      `rm -f ${archivePath}`,
    ])
  },

  async upload(
    src: string,
    dest: string,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    step: StepCallback = () => {}
  ) {
    const sftp = this.ssh.sftp()

    await sftp.fastPut(src, dest, {
      chunkSize: 500,
      step,
    })
  },
})

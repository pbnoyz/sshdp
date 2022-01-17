import tempy from 'tempy'
import archiver from 'archiver'
import { join } from 'node:path'
import { createWriteStream } from 'node:fs'

const { create }  = archiver

export const zip = (
  dirpath: string,
  folderName: string,
  compressLevel = 9
): Promise<string> =>
  new Promise((resolve, reject) => {
    const tempDir = tempy.directory({ prefix: 'sshdp_' })
    const archivePath = join(tempDir, 'dist.zip')

    const archiver = create('zip', {
      zlib: { level: compressLevel },
    })

    const output = createWriteStream(archivePath)

    output.on('close', () => resolve(archivePath))
    archiver.on('error', (e) => reject(e))

    archiver.pipe(output)

    archiver.directory(dirpath, folderName)
    archiver.finalize()
  })

export const localDateTimeString = () =>
  new Date().toLocaleString('sv-SE').replace(/\s/, '-')

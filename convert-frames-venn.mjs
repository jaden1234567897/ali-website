import sharp from 'sharp'
import { readdir } from 'fs/promises'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dir    = fileURLToPath(new URL('.', import.meta.url))
const SRC_DIR  = resolve('C:/Users/Maestro/Desktop/frames 2/venn')
const DEST_DIR = resolve(__dir, 'public/frames-venn')
const QUALITY  = 95

const files = (await readdir(SRC_DIR))
  .filter(f => f.endsWith('.png'))
  .sort()

console.log(`Converting ${files.length} venn frames at WebP quality ${QUALITY}…`)

let done = 0
for (const file of files) {
  const src  = join(SRC_DIR, file)
  const dest = join(DEST_DIR, file.replace('.png', '.webp'))
  await sharp(src)
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(dest)
  done++
  if (done % 10 === 0 || done === files.length) {
    process.stdout.write(`\r  ${done}/${files.length}`)
  }
}

console.log('\nDone.')

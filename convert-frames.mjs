/**
 * Converts PNG frames → high-quality WebP (quality 90, lossless metadata).
 * Run once from the website/ directory:  node convert-frames.mjs
 */

import sharp from 'sharp'
import { readdir } from 'fs/promises'
import { join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dir    = fileURLToPath(new URL('.', import.meta.url))
const SRC_DIR  = resolve(__dir, '../frames 1/ali')
const DEST_DIR = resolve(__dir, 'public/frames')
const QUALITY  = 95   // 95 = near-lossless; preserves fine particle details

const files = (await readdir(SRC_DIR))
  .filter(f => f.endsWith('.png'))
  .sort()

console.log(`Converting ${files.length} frames at WebP quality ${QUALITY}…`)

let done = 0
for (const file of files) {
  const src  = join(SRC_DIR, file)
  const dest = join(DEST_DIR, file.replace('.png', '.webp'))
  await sharp(src)
    .webp({ quality: QUALITY, effort: 6 })   // effort 6 = best compression for given quality
    .toFile(dest)
  done++
  if (done % 10 === 0 || done === files.length) {
    process.stdout.write(`\r  ${done}/${files.length}`)
  }
}

console.log('\nDone.')

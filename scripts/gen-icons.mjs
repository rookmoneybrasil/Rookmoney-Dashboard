/**
 * Generates PWA icons (192x192 and 512x512) from an SVG using sharp.
 * Run: node scripts/gen-icons.mjs
 */
import sharp from 'sharp'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root      = resolve(__dirname, '..')

// Simple branded SVG icon (dark bg + "R" letter in brand blue)
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#020f21"/>
  <text
    x="50%"
    y="50%"
    dominant-baseline="central"
    text-anchor="middle"
    font-family="'Helvetica Neue', Helvetica, Arial, sans-serif"
    font-weight="700"
    font-size="280"
    fill="#3b82f6"
  >R</text>
</svg>`

const buf = Buffer.from(svgIcon)

await sharp(buf).resize(192, 192).png().toFile(resolve(root, 'public/icon-192.png'))
console.log('✔ icon-192.png')

await sharp(buf).resize(512, 512).png().toFile(resolve(root, 'public/icon-512.png'))
console.log('✔ icon-512.png')

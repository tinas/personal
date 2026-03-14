import { Buffer } from 'node:buffer'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { generateOgImages } from './og-image.mjs'

const __dirname = resolve(fileURLToPath(import.meta.url), '..')
const fontsDir = resolve(__dirname, 'cache/fonts')
const fontPath = resolve(fontsDir, 'Inter-Bold.ttf')

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@700&display=swap'

async function fetchFontUrl(): Promise<string> {
  const res = await fetch(FONT_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' },
  })
  const css = await res.text()
  const match = css.match(/src:\s*url\(([^)]+)\)/)
  if (!match)
    throw new Error('Could not find font URL in Google Fonts CSS')
  return match[1]
}

async function ensureFont() {
  if (existsSync(fontPath))
    return
  console.warn('Downloading Inter font...')
  await mkdir(fontsDir, { recursive: true })
  const url = await fetchFontUrl()
  const res = await fetch(url)
  if (!res.ok)
    throw new Error(`Failed to download font: ${res.statusText}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  await writeFile(fontPath, buffer)
  console.warn('Font downloaded.')
}

async function main() {
  await ensureFont()
  await generateOgImages(fontPath)
  console.warn('OG images generated successfully!')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

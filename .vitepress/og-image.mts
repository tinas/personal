import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import matter from 'gray-matter'
import satori from 'satori'
import sharp from 'sharp'

import { OG_IMAGE_SIZE, SITE_TAGLINE, SITE_TITLE } from './site'
import { estimateReadingTime, formatDate, isPublished } from './utils'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const publicDir = resolve(rootDir, 'public')
const outputDir = resolve(publicDir, 'og')
const manifestPath = resolve(__dirname, 'cache/og/manifest.json')
const fontsDir = resolve(rootDir, 'node_modules/@fontsource/literata/files')
const profilePath = resolve(publicDir, 'profile.png')

const { width: WIDTH, height: HEIGHT } = OG_IMAGE_SIZE

// The light "paper" palette from style.css.
const PAPER = '#f8f1e3'
const INK = '#2a2118'
const INK_2 = '#5c4b3a'
const INK_3 = '#776552'
const RULE = '#d5c5aa'
const RIBBON = '#c4552b'

const RIBBON_SVG = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="132"><path d="M0 0h48v132l-24-20-24 20z" fill="${RIBBON}"/></svg>`,
)}`

// Same pre-colored noise as the site background, composited on top at the end.
const GRAIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.36 0 0 0 0 0.29 0 0 0 0 0.22 0.4 0 0 0 -0.13"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`

interface PostCard {
  kind: 'post'
  file: string
  title: string
  meta: string
  photoPath?: string
}

interface SiteCard {
  kind: 'site'
  file: string
}

type Card = PostCard | SiteCard

interface Node {
  type: string
  props: Record<string, unknown>
}

/** A tiny `h()` for satori's element objects. */
function h(type: string, props: Record<string, unknown>, ...children: (Node | string | false | undefined)[]): Node {
  const kids = children.filter(child => child !== false && child !== undefined)
  return { type, props: { ...props, children: kids.length === 1 ? kids[0] : kids } }
}

function loadFont(file: string): ArrayBuffer {
  const buffer = readFileSync(resolve(fontsDir, file))
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
}

// Satori reads neither woff2 nor variable fonts, hence the static woff files.
// It also keeps only one font per name, weight and style, so the `latin-ext`
// subset (ş, ğ, İ…) is registered under its own name and used as a fallback.
const FONT_FAMILIES = { latin: 'Literata', 'latin-ext': 'Literata Ext' } as const

const FONTS = (['latin', 'latin-ext'] as const).flatMap(subset =>
  [
    { weight: 400, style: 'normal' },
    { weight: 400, style: 'italic' },
    { weight: 600, style: 'normal' },
  ].map(({ weight, style }) => ({
    name: FONT_FAMILIES[subset],
    weight: weight as 400 | 600,
    style: style as 'normal' | 'italic',
    data: loadFont(`literata-${subset}-${weight}-${style}.woff`),
  })),
)

async function toDataUri(image: sharp.Sharp, format: 'png' | 'jpeg'): Promise<string> {
  const buffer = await (format === 'png' ? image.png() : image.jpeg({ quality: 90 })).toBuffer()
  return `data:image/${format};base64,${buffer.toString('base64')}`
}

/** The portrait, warmed to the same sepia as on the home page. */
function portrait(size: number): Promise<string> {
  return toDataUri(
    sharp(profilePath)
      .resize(size * 2, size * 2)
      .tint('#8a7560'),
    'png',
  )
}

function titleSize(title: string, hasPhoto: boolean): number {
  if (title.length <= 40) return hasPhoto ? 60 : 72
  if (title.length <= 64) return hasPhoto ? 54 : 64
  return hasPhoto ? 46 : 56
}

/** Site name, ribbon and paper, shared by every card. */
function page(...content: Node[]): Node {
  return h(
    'div',
    {
      style: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: WIDTH,
        height: HEIGHT,
        padding: '56px 72px 52px',
        backgroundColor: PAPER,
        fontFamily: `${FONT_FAMILIES.latin}, ${FONT_FAMILIES['latin-ext']}`,
        color: INK,
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          paddingBottom: 22,
          borderBottom: `1px solid ${RULE}`,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '-0.01em',
          color: INK_2,
        },
      },
      'tinas.dev',
    ),
    ...content,
    h('img', { src: RIBBON_SVG, width: 48, height: 132, style: { position: 'absolute', top: 0, right: 72 } }),
  )
}

async function postMarkup(card: PostCard): Promise<Node> {
  const photo = card.photoPath
    ? await toDataUri(sharp(card.photoPath).resize(680, 680, { fit: 'cover' }).modulate({ saturation: 0.9 }), 'jpeg')
    : undefined

  return page(
    h(
      'div',
      { style: { display: 'flex', flex: 1, alignItems: 'center', gap: 56 } },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', flex: 1 } },
        h(
          'div',
          {
            style: {
              fontSize: titleSize(card.title, Boolean(photo)),
              fontWeight: 600,
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
            },
          },
          card.title,
        ),
        h('div', { style: { marginTop: 28, fontSize: 26, fontStyle: 'italic', color: INK_3 } }, card.meta),
      ),
      photo &&
        h('img', {
          src: photo,
          width: 340,
          height: 340,
          style: { borderRadius: 8, boxShadow: '0 18px 40px -20px rgba(42, 33, 24, 0.55)' },
        }),
    ),
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: 18 } },
      h('img', { src: await portrait(56), width: 56, height: 56, style: { borderRadius: 28 } }),
      h('div', { style: { fontSize: 24, fontWeight: 600 } }, SITE_TITLE),
    ),
  )
}

async function siteMarkup(): Promise<Node> {
  return page(
    h(
      'div',
      { style: { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', gap: 64 } },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', flex: 1 } },
        h('div', { style: { fontSize: 92, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.03em' } }, SITE_TITLE),
        h(
          'div',
          {
            style: {
              marginTop: 32,
              fontSize: 30,
              fontStyle: 'italic',
              lineHeight: 1.45,
              color: INK_2,
              textWrap: 'balance',
            },
          },
          SITE_TAGLINE,
        ),
      ),
      h('img', {
        src: await portrait(300),
        width: 300,
        height: 300,
        style: { borderRadius: 150, boxShadow: '0 22px 48px -22px rgba(42, 33, 24, 0.6)' },
      }),
    ),
  )
}

async function render(card: Card): Promise<Buffer> {
  const markup = card.kind === 'post' ? await postMarkup(card) : await siteMarkup()
  const svg = await satori(markup as any, { width: WIDTH, height: HEIGHT, fonts: FONTS })

  return sharp(Buffer.from(svg))
    .composite([{ input: Buffer.from(GRAIN_SVG) }])
    .jpeg({ quality: 90 })
    .toBuffer()
}

function loadCards(): Card[] {
  const writingDir = resolve(rootDir, 'writing')
  const posts = readdirSync(writingDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(resolve(writingDir, entry.name, 'index.md')))
    .flatMap(({ name: slug }): PostCard[] => {
      const postDir = resolve(writingDir, slug)
      const content = readFileSync(resolve(postDir, 'index.md'), 'utf-8')
      const { data } = matter(content)
      if (!isPublished(data)) return []

      // Relative to the post's folder, like any other path in its markdown.
      const photoPath = data.photo?.image ? resolve(postDir, data.photo.image) : undefined
      if (photoPath && !existsSync(photoPath))
        console.warn(`Cover image not found for ${slug}, rendering without it: ${photoPath}`)

      return [
        {
          kind: 'post',
          file: `${slug}.jpg`,
          title: data.title,
          meta: `${formatDate(data.date)} · ${estimateReadingTime(content)} min read`,
          photoPath: photoPath && existsSync(photoPath) ? photoPath : undefined,
        },
      ]
    })

  return [{ kind: 'site', file: 'site.jpg' }, ...posts]
}

/**
 * A card is re-rendered only when something that ends up in it changes: its
 * text (including the site name and tagline from site.ts), its images, or this
 * template file itself.
 */
function cardHash(card: Card, templateSource: Buffer): string {
  const hash = createHash('sha256')
    .update(templateSource)
    .update(JSON.stringify([card, SITE_TITLE, SITE_TAGLINE]))
    .update(readFileSync(profilePath))
  if (card.kind === 'post' && card.photoPath) hash.update(readFileSync(card.photoPath))
  return hash.digest('hex').slice(0, 16)
}

export async function generateOgImages() {
  const templateSource = readFileSync(fileURLToPath(import.meta.url))
  const manifest: Record<string, string> = existsSync(manifestPath)
    ? JSON.parse(readFileSync(manifestPath, 'utf-8'))
    : {}
  const nextManifest: Record<string, string> = {}

  await mkdir(outputDir, { recursive: true })

  for (const card of loadCards()) {
    const outputPath = resolve(outputDir, card.file)
    const hash = cardHash(card, templateSource)
    nextManifest[card.file] = hash

    if (manifest[card.file] === hash && existsSync(outputPath)) {
      console.warn(`Up to date: og/${card.file}`)
      continue
    }

    await writeFile(outputPath, await render(card))
    console.warn(`Generated: og/${card.file}`)
  }

  await mkdir(dirname(manifestPath), { recursive: true })
  await writeFile(manifestPath, `${JSON.stringify(nextManifest, null, 2)}\n`)
}

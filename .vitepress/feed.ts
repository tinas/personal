import { readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'

import { Feed } from 'feed'
import type { SiteConfig } from 'vitepress'
import { createContentLoader } from 'vitepress'

import { isPublished } from './utils'

const COMPONENT_TAG_REGEX = /<Writing[A-Z]\w*\s*\/>/g
const HEADER_ANCHOR_REGEX = /<a class="header-anchor"[^>]*>[\s\S]*?<\/a>/g
const FIRST_H1_REGEX = /<h1[\s\S]*?<\/h1>/
const ROOT_RELATIVE_URL_REGEX = /(href|src)="\/(?!\/)/g
const RELATIVE_SRC_REGEX = /src="(\.{1,2}\/[^"]+)"/g
const ASSET_SRC_REGEX = /src="(\/assets\/[^"]+)"/g
const ASSET_HASH_REGEX = /\.[\w-]+(\.\w+)$/

interface FeedOptions {
  siteUrl: string
  title: string
  description: string
  image: string
  author: { name: string; link: string }
}

/**
 * Images in a post's folder come out of the markdown with their source paths
 * (`./diagram.png`), but Vite publishes them under hashed names. The built page
 * has those, so they are matched up by file name.
 */
function resolveLocalImages(html: string, builtPage: string, url: string): string {
  const assets = new Map(
    [...builtPage.matchAll(ASSET_SRC_REGEX)].map(([, src]) => [basename(src).replace(ASSET_HASH_REGEX, '$1'), src]),
  )

  return html.replace(RELATIVE_SRC_REGEX, (match, src: string) => {
    const asset = assets.get(basename(src))
    if (!asset) console.warn(`Feed: no published file found for ${src} in ${url}, leaving it relative.`)
    return asset ? `src="${asset}"` : match
  })
}

/** Turns rendered post HTML into something RSS readers can show on their own. */
function toFeedContent(html: string, siteUrl: string): string {
  return html
    .replace(COMPONENT_TAG_REGEX, '')
    .replace(HEADER_ANCHOR_REGEX, '')
    .replace(FIRST_H1_REGEX, '')
    .replace(ROOT_RELATIVE_URL_REGEX, `$1="${siteUrl}/`)
}

export async function generateFeed(config: SiteConfig, { siteUrl, title, description, image, author }: FeedOptions) {
  const feed = new Feed({
    id: `${siteUrl}/`,
    link: `${siteUrl}/`,
    title,
    description,
    image,
    language: 'en',
    copyright: `© ${new Date().getFullYear()} ${author.name}`,
    feedLinks: { rss: `${siteUrl}/feed.xml` },
    author,
  })

  const posts = await createContentLoader('writing/*/index.md', { render: true }).load()

  posts
    .filter(post => isPublished(post.frontmatter))
    .toSorted((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime())
    .forEach(({ url, frontmatter, html }) => {
      const link = `${siteUrl}${url}`
      const builtPage = readFileSync(resolve(config.outDir, `${url.slice(1)}.html`), 'utf-8')
      feed.addItem({
        title: frontmatter.title,
        id: link,
        link,
        description: frontmatter.description,
        content: html ? toFeedContent(resolveLocalImages(html, builtPage, url), siteUrl) : undefined,
        author: [author],
        date: new Date(frontmatter.date),
      })
    })

  writeFileSync(resolve(config.outDir, 'feed.xml'), feed.rss2())
}

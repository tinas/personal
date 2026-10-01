import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type { HeadConfig } from 'vitepress'
import { defineConfig } from 'vitepress'

import { generateFeed } from './feed'
import { OG_IMAGE_SIZE, SITE_DESCRIPTION, SITE_OG_IMAGE, SITE_TITLE, SITE_URL } from './site'
import { estimateReadingTime, getWritingSlug, isPublished } from './utils'

const __dirname = dirname(fileURLToPath(import.meta.url))

const OG_TITLE = 'Ahmet Tinastepe'

const PAGE_PATH_REGEX = /(?:index)?\.md$/

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,

  cleanUrls: true,

  sitemap: {
    hostname: SITE_URL,
  },

  markdown: {
    theme: {
      light: 'gruvbox-light-medium',
      dark: 'gruvbox-dark-medium',
    },
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: SITE_TITLE, href: '/feed.xml' }],

    ['meta', { name: 'author', content: OG_TITLE }],
    ['meta', { name: 'theme-color', content: '#f8f1e3', media: '(prefers-color-scheme: light)' }],
    ['meta', { name: 'theme-color', content: '#1b1611', media: '(prefers-color-scheme: dark)' }],
  ],

  themeConfig: {
    // Only `nav`, `socialLinks` and `footer` are used, by the custom Layout.

    nav: [
      { text: 'Writing', link: '/writing/' },
      { text: 'About', link: '/about-me' },
    ],

    footer: {
      copyright: `© ${new Date().getFullYear()} ${SITE_TITLE}`,
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/tinas' },
      { icon: 'x', link: 'https://x.com/tinasdev' },
      { icon: 'bluesky', link: 'https://bsky.app/profile/tinas.dev' },
      { icon: 'instagram', link: 'https://instagram.com/tinasdev' },
      { icon: 'figma', link: 'https://figma.com/@tinas' },
    ],
  },

  transformPageData(pageData) {
    if (!getWritingSlug(pageData.relativePath)) return

    const filePath = resolve(__dirname, '..', pageData.relativePath)
    const content = readFileSync(filePath, 'utf-8')
    pageData.frontmatter.readingTime = estimateReadingTime(content)
  },

  // Open Graph / Twitter tags for every page. Posts get their own title,
  // description and generated image (see og-image.mts), so their frontmatter
  // stays clean.
  transformHead({ pageData }) {
    const slug = getWritingSlug(pageData.relativePath)
    const isPost = slug !== null && isPublished(pageData.frontmatter)

    const title = isPost ? pageData.frontmatter.title : OG_TITLE
    const description = (isPost && pageData.frontmatter.description) || SITE_DESCRIPTION
    const image = isPost ? `${SITE_URL}/og/${slug}.jpg` : SITE_OG_IMAGE
    const imageAlt = isPost ? `${pageData.frontmatter.title}, by ${SITE_TITLE}` : SITE_TITLE
    const url = `${SITE_URL}/${pageData.relativePath.replace(PAGE_PATH_REGEX, '')}`

    const head: HeadConfig[] = [
      ['meta', { property: 'og:type', content: isPost ? 'article' : 'website' }],
      ['meta', { property: 'og:site_name', content: 'tinas.dev' }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:image', content: image }],
      ['meta', { property: 'og:image:width', content: String(OG_IMAGE_SIZE.width) }],
      ['meta', { property: 'og:image:height', content: String(OG_IMAGE_SIZE.height) }],
      ['meta', { property: 'og:image:alt', content: imageAlt }],

      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: image }],
      ['meta', { name: 'twitter:image:alt', content: imageAlt }],
    ]

    if (isPost)
      head.push([
        'meta',
        { property: 'article:published_time', content: new Date(pageData.frontmatter.date).toISOString() },
      ])

    return head
  },

  buildEnd(siteConfig) {
    return generateFeed(siteConfig, {
      siteUrl: SITE_URL,
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      image: SITE_OG_IMAGE,
      author: { name: SITE_TITLE, link: SITE_URL },
    })
  },
})

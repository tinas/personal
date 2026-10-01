import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitepress'

import { estimateReadingTime, getWritingSlug } from './utils'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SITE_URL = 'https://www.tinas.dev'
const IMAGE_URL = `${SITE_URL}/thumb.jpg`
const SITE_TITLE = 'Ahmet Tınastepe'
const OG_TITLE = 'Ahmet Tinastepe'
const OG_DESCRIPTION =
  "I build things for the web at MobileAction, and I maintain a handful of open-source libraries. Here I keep notes on what I'm working on and the problems I run into along the way."

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: SITE_TITLE,
  description: OG_DESCRIPTION,

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

    ['meta', { name: 'author', content: OG_TITLE }],
    ['meta', { name: 'theme-color', content: '#f8f1e3', media: '(prefers-color-scheme: light)' }],
    ['meta', { name: 'theme-color', content: '#1b1611', media: '(prefers-color-scheme: dark)' }],

    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'tinas.dev' }],
    ['meta', { property: 'og:title', content: OG_TITLE }],
    ['meta', { property: 'og:description', content: OG_DESCRIPTION }],
    ['meta', { property: 'og:url', content: SITE_URL }],
    ['meta', { property: 'og:image', content: IMAGE_URL }],

    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: OG_TITLE }],
    ['meta', { name: 'twitter:description', content: OG_DESCRIPTION }],
    ['meta', { name: 'twitter:image', content: IMAGE_URL }],
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
})

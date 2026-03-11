import { defineConfig } from 'vitepress'

const SITE_URL = 'https://www.tinas.dev'
const IMAGE_URL = `${SITE_URL}/thumb.jpg`
const OG_TITLE = 'Ahmet Tınastepe'
const OG_DESCRIPTION = 'simplifying things for a living. sometimes it\'s code, sometimes it\'s dinner.'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: OG_TITLE,
  description: OG_DESCRIPTION,

  cleanUrls: true,

  sitemap: {
    hostname: SITE_URL,
  },

  head: [
    [
      'link',
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22><rect width=%22100%22 height=%22100%22 fill=%22%23FF7A3D%22/><text x=%2250%25%22 y=%2258%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2270%22 fill=%22white%22 font-family=%22Arial, sans-serif%22>A</text></svg>',
      },
    ],

    ['meta', { name: 'author', content: OG_TITLE }],
    ['meta', { name: 'theme-color', content: '#ff7a3d' }],

    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'tinas.dev' }],
    ['meta', { property: 'og:description', content: OG_DESCRIPTION }],
    ['meta', { property: 'og:url', content: SITE_URL }],

    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:description', content: OG_DESCRIPTION }],
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    search: {
      provider: 'local',
    },

    nav: [
      { text: 'Writing', link: '/writing', activeMatch: '/writing/' },
      { text: 'About Me', link: '/about-me' },
    ],

    footer: {
      copyright: `© 2026 ${OG_TITLE}`,
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/tinas' },
      { icon: 'figma', link: 'https://figma.com/@tinas' },
      { icon: 'x', link: 'https://x.com/tinasdev' },
      { icon: 'instagram', link: 'https://instagram.com/tinasdev' },
      { icon: 'bluesky', link: 'https://bsky.app/profile/tinasdev.bsky.social' },
    ],
  },

  transformPageData(pageData) {
    let ogTitle = OG_TITLE
    let ogImage = IMAGE_URL

    const isWritingPage = /^writing\/(?!.*index\.md$).+\.md$/.test(pageData.relativePath)
    if (isWritingPage) {
      const imagePath = `/${pageData.relativePath.replace(/\.md$/, '.jpg')}`
      ogTitle = pageData.title
      ogImage = `${SITE_URL}${imagePath}`
    }

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['meta', { property: 'og:title', content: ogTitle }],
      ['meta', { property: 'og:image', content: ogImage }],
      ['meta', { name: 'twitter:title', content: ogTitle }],
      ['meta', { name: 'twitter:image', content: ogImage }],
    )
  },
})

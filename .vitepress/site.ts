// Site-wide constants shared by the VitePress config and the OG image script.

export const SITE_URL = 'https://www.tinas.dev'
export const SITE_TITLE = 'Ahmet Tınastepe'

export const SITE_TAGLINE =
  'I write about Vue, TypeScript, and the small lessons I pick up while building things for the web.'
export const SITE_DESCRIPTION = `Hi, I'm Ahmet. ${SITE_TAGLINE}`

export const OG_IMAGE_SIZE = { width: 1200, height: 630 }
/** Share image for pages that aren't posts (home, about, writing index). */
export const SITE_OG_IMAGE = `${SITE_URL}/og/site.jpg`

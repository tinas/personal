import process from 'node:process'

import { generateOgImages } from './og-image.mjs'

generateOgImages()
  .then(() => console.warn('OG images are ready.'))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })

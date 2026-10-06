import { createContentLoader } from 'vitepress'

import { isPublished } from '../../utils.ts'

export interface WritingData {
  slug: string
  url: string
  title: string
  description?: string
  date: string
}

declare const data: WritingData[]
export { data }

export default createContentLoader('writing/*/index.md', {
  transform(rawData) {
    return rawData
      .filter(page => isPublished(page.frontmatter))
      .map((page): WritingData => ({
        slug: page.url.replace('/writing/', ''),
        url: page.url,
        title: page.frontmatter.title,
        description: page.frontmatter.description,
        date: page.frontmatter.date,
      }))
      .toSorted((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },
})

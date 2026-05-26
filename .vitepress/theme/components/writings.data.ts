import { createContentLoader } from 'vitepress'

export interface WritingData {
  slug: string
  title: string
  date: string
  photo: {
    by: string
    href: string
    image: string
  }
}

declare const data: WritingData[]
export { data }

export default createContentLoader('writing/*.md', {
  transform(rawData) {
    return rawData
      .filter(page => !page.url.endsWith('/writing/'))
      .map((page): WritingData => ({
        slug: page.url.replace('/writing/', ''),
        title: page.frontmatter.title,
        date: page.frontmatter.date,
        photo: page.frontmatter.photo,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },
})

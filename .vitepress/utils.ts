const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

const FRONTMATTER_REGEX = /---[\s\S]*?---/
const HTML_TAG_REGEX = /<[^>]+>/g
const CODE_BLOCK_REGEX = /```[\s\S]*?```/g
const MD_SYNTAX_REGEX = /[#*_`~[()\]>|]/g
const WHITESPACE_REGEX = /\s+/
const WRITING_POST_REGEX = /^writing\/(?!index\.md$)(.+)\.md$/

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return dateFormatter.format(d)
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return shortDateFormatter.format(d)
}

/** Returns the slug of a writing post (e.g. `writing/foo.md` -> `foo`), or `null` for any other page. */
export function getWritingSlug(relativePath: string): string | null {
  return relativePath.match(WRITING_POST_REGEX)?.[1] ?? null
}

/** A post is published once it has both a title and a date in its frontmatter. */
export function isPublished(frontmatter: Record<string, any>): boolean {
  return Boolean(frontmatter.title && frontmatter.date)
}

export function estimateReadingTime(content: string): number {
  const text = content
    .replace(FRONTMATTER_REGEX, '')
    .replace(HTML_TAG_REGEX, '')
    .replace(CODE_BLOCK_REGEX, '')
    .replace(MD_SYNTAX_REGEX, '')
    .trim()

  const words = text.split(WHITESPACE_REGEX).filter(Boolean).length
  return Math.max(1, Math.round(words / 238))
}

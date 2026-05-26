const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
})

const FRONTMATTER_REGEX = /---[\s\S]*?---/
const HTML_TAG_REGEX = /<[^>]+>/g
const CODE_BLOCK_REGEX = /```[\s\S]*?```/g
const MD_SYNTAX_REGEX = /[#*_`~[()\]>|]/g
const WHITESPACE_REGEX = /\s+/

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return dateFormatter.format(d)
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

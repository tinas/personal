<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'

import { formatDate } from '../../utils'

const { frontmatter } = useData()

const formattedDate = computed(() => {
  const date = frontmatter.value.date
  return date ? formatDate(date) : null
})

const readingTime = computed<number | undefined>(() => frontmatter.value.readingTime)
</script>

<template>
  <p v-if="formattedDate" class="writing-meta">
    <time :datetime="frontmatter.date">{{ formattedDate }}</time>
    <template v-if="readingTime">
      <span class="separator" aria-hidden="true">·</span>
      <span>{{ readingTime }} min read</span>
    </template>
  </p>
</template>

<style scoped>
.writing-meta {
  margin: 1.25rem 0 2.5rem;
  font-size: 1rem;
  font-style: italic;
  line-height: 1.5;
  color: var(--vp-c-text-3);
}

.separator {
  margin: 0 0.6rem;
}
</style>

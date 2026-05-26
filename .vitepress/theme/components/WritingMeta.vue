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
  <p v-if="formattedDate">
    <em>
      <span>{{ formattedDate }}</span>
      <span v-if="readingTime" class="separator">&middot;</span>
      <span v-if="readingTime">{{ readingTime }} min read</span>
    </em>
  </p>
</template>

<style scoped>
.separator {
  margin: 0 0.4rem;
}
</style>

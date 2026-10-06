<script setup lang="ts">
import { formatShortDate } from '../../utils'
import { data as writings } from './writings.data'
</script>

<template>
  <ol class="contents">
    <li v-for="writing in writings" :key="writing.slug" class="entry">
      <a :href="writing.url" class="entry-link">
        <span class="entry-line">
          <span class="entry-title">{{ writing.title }}</span>
          <span class="entry-leader" aria-hidden="true" />
          <time :datetime="writing.date" class="entry-date">{{ formatShortDate(writing.date) }}</time>
        </span>
        <span v-if="writing.description" class="entry-description">{{ writing.description }}</span>
      </a>
    </li>
  </ol>
</template>

<style scoped>
.contents {
  margin: 1.5rem 0 0;
  padding: 0;
  list-style: none;
}

/* Entries rise one after another; without `sibling-index()` they rise together. */
.entry {
  animation: rise 0.8s var(--ease-out) both;
  animation-delay: var(--list-delay, 300ms);
  animation-delay: calc(var(--list-delay, 300ms) + (sibling-index() - 1) * 90ms);
}

/* On the home page the list waits for the name and intro to settle first. */
:global(.home) .entry {
  --list-delay: 1000ms;
}

.entry + .entry {
  margin-top: 0;
}

.entry-link {
  display: block;
  padding: 1.25rem 0;
  border-top: 1px solid var(--vp-c-divider);
  font-weight: inherit;
  color: var(--vp-c-text-1);
  text-decoration: none;
  transition: opacity 0.3s ease;
}

/* Hovering one entry quietly steps the others back. */
.contents:has(.entry-link:hover) .entry-link:not(:hover) {
  opacity: 0.45;
}

.entry-line {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.entry-title {
  font-size: 1.3125rem;
  font-weight: 500;
  line-height: 1.35;
  text-wrap: balance;
  transition: color 0.3s ease;
}

/* Dotted leader running from the title to the date, as in a table of contents. */
.entry-leader {
  flex: 1;
  min-width: 1.5rem;
  border-bottom: 1px dotted var(--vp-c-border);
  transform: translateY(-0.3em);
  transition: border-color 0.3s ease;
}

.entry-date {
  flex: none;
  font-size: 0.9375rem;
  font-style: italic;
  font-variant-numeric: oldstyle-nums;
  color: var(--vp-c-text-3);
}

.entry-description {
  display: block;
  max-width: 36rem;
  margin-top: 0.375rem;
  font-size: 1.0625rem;
  line-height: 1.55;
  color: var(--vp-c-text-2);
  text-wrap: pretty;
}

.entry-link:hover .entry-title {
  color: var(--vp-c-brand-1);
}

.entry-link:hover .entry-leader {
  border-color: var(--vp-c-brand-1);
}

@media (max-width: 36rem) {
  .entry-line {
    flex-direction: column;
    gap: 0.25rem;
  }

  .entry-leader {
    display: none;
  }

  .entry-date {
    order: -1;
  }
}
</style>

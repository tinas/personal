<script setup lang="ts">
import type { DefaultTheme } from 'vitepress'
import { useData } from 'vitepress'
import { computed } from 'vue'

import { getWritingSlug } from '../../utils'
import { data as writings } from './writings.data'

const { page, theme } = useData<DefaultTheme.Config>()

const index = computed(() => writings.findIndex(writing => writing.slug === getWritingSlug(page.value.relativePath)))
const newer = computed(() => (index.value > 0 ? writings[index.value - 1] : undefined))
const older = computed(() => (index.value >= 0 ? writings[index.value + 1] : undefined))

function socialLink(icon: string) {
  return theme.value.socialLinks?.find(link => link.icon === icon)?.link
}
</script>

<template>
  <footer class="writing-footer">
    <p class="sign-off">
      Thanks for reading! If this helped, or if you think I got something wrong, I'd love to hear about it on
      <a :href="socialLink('bluesky')" target="_blank" rel="noopener">Bluesky</a>
      or <a :href="socialLink('x')" target="_blank" rel="noopener">X</a>.
    </p>

    <nav v-if="older || newer" class="pager" aria-label="More writing">
      <a v-if="older" :href="older.url" class="pager-link older">
        <span class="pager-label smallcaps">← Older</span>
        <span class="pager-title">{{ older.title }}</span>
      </a>
      <a v-if="newer" :href="newer.url" class="pager-link newer">
        <span class="pager-label smallcaps">Newer →</span>
        <span class="pager-title">{{ newer.title }}</span>
      </a>
    </nav>
  </footer>
</template>

<style scoped>
.writing-footer {
  margin-top: 4rem;
}

/* The same scene-break mark as `---` in prose, closing the chapter. */
.writing-footer::before {
  content: '*  *  *';
  display: block;
  margin-bottom: 2.5rem;
  white-space: pre;
  text-align: center;
  color: var(--vp-c-text-3);
}

.sign-off {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.65;
  font-style: italic;
  color: var(--vp-c-text-2);
}

.sign-off a {
  color: var(--vp-c-text-1);
  text-decoration: underline;
  text-decoration-color: var(--vp-c-brand-1);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.2em;
}

.sign-off a:hover {
  color: var(--vp-c-brand-1);
}

.pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
}

.pager-link {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--vp-c-text-1);
}

.newer {
  grid-column: 2;
  text-align: right;
}

.pager-label {
  color: var(--vp-c-text-3);
}

.pager-title {
  font-size: 1.125rem;
  font-weight: 500;
  line-height: 1.4;
  text-wrap: balance;
  transition: color 0.3s ease;
}

.pager-link:hover .pager-title {
  color: var(--vp-c-brand-1);
}

@media (max-width: 560px) {
  .pager {
    grid-template-columns: 1fr;
  }

  .newer {
    grid-column: 1;
    text-align: left;
  }
}
</style>

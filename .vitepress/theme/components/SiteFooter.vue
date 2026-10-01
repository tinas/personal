<script setup lang="ts">
import type { DefaultTheme } from 'vitepress'
import { useData } from 'vitepress'
import { computed } from 'vue'

const LABELS: Record<string, string> = {
  github: 'GitHub',
  x: 'X',
  bluesky: 'Bluesky',
  instagram: 'Instagram',
  figma: 'Figma',
}

const { theme } = useData<DefaultTheme.Config>()

const links = computed(() =>
  (theme.value.socialLinks ?? []).map(({ icon, link, ariaLabel }) => ({
    link,
    text: ariaLabel ?? (typeof icon === 'string' ? (LABELS[icon] ?? icon) : link),
  })),
)
</script>

<template>
  <footer class="site-footer">
    <ul class="links">
      <li v-for="item in links" :key="item.link">
        <a :href="item.link" class="smallcaps" target="_blank" rel="noopener">{{ item.text }}</a>
      </li>
      <li>
        <a href="/feed.xml" class="smallcaps">RSS</a>
      </li>
    </ul>
    <p v-if="theme.footer?.copyright" class="copyright">
      {{ theme.footer.copyright }}
    </p>
  </footer>
</template>

<style scoped>
.site-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 2rem;
  width: min(var(--frame), 100% - 2 * var(--gutter));
  margin: 0 auto;
  padding: 2rem 0 3rem;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.5rem;
}

.links a {
  color: var(--vp-c-text-2);
  transition:
    color 0.3s ease,
    opacity 0.3s ease;
}

.links a:hover {
  color: var(--vp-c-brand-1);
}

/* Hovering one link quietly steps the others back. */
.links:has(a:hover) a:not(:hover) {
  opacity: 0.45;
}

.copyright {
  font-size: 0.9375rem;
  font-style: italic;
}
</style>

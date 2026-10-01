<script setup lang="ts">
import type { DefaultTheme } from 'vitepress'
import { useData } from 'vitepress'
import { computed, nextTick } from 'vue'

const INDEX_SUFFIX_REGEX = /(?:index)?\.md$/

const { site, theme, page, frontmatter, isDark } = useData<DefaultTheme.Config>()

// The home page shows the name large, so the header leaves it out there.
const isHome = computed(() => frontmatter.value.layout === 'home')

// `link` may also be a function of the current page in VitePress 2.
const nav = computed(() =>
  (theme.value.nav ?? []).flatMap(item =>
    'link' in item
      ? [{ text: item.text, link: typeof item.link === 'function' ? item.link(page.value) : item.link }]
      : [],
  ),
)

function isActive(link: string) {
  return `/${page.value.relativePath}`.replace(INDEX_SUFFIX_REGEX, '').startsWith(link)
}

async function toggleAppearance() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduceMotion) {
    isDark.value = !isDark.value
    return
  }

  await document.startViewTransition(async () => {
    isDark.value = !isDark.value
    await nextTick()
  }).finished
}
</script>

<template>
  <header class="site-header">
    <a v-if="!isHome" href="/" class="brand smallcaps">{{ site.title }}</a>

    <nav class="nav" aria-label="Main">
      <a
        v-for="item in nav"
        :key="item.link"
        :href="item.link"
        class="nav-link smallcaps"
        :class="{ active: isActive(item.link) }"
        :aria-current="isActive(item.link) ? 'page' : undefined"
      >
        {{ item.text }}
      </a>

      <button
        type="button"
        class="appearance"
        aria-label="Toggle dark mode"
        title="Toggle dark mode"
        @click="toggleAppearance"
      >
        <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 0 0 12 21a9.003 9.003 0 0 0 8.354-5.646Z" />
        </svg>
        <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
          />
        </svg>
      </button>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: min(var(--frame), 100% - 2 * var(--gutter));
  height: 5.5rem;
  margin: 0 auto;
  border-bottom: 1px solid var(--vp-c-divider);
}

/* Brand and links share one size and line-height, so their baselines line up. */
.brand,
.nav-link {
  line-height: 1;
}

.brand {
  font-weight: 600;
  white-space: nowrap;
  color: var(--vp-c-text-1);
}

.nav {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-left: auto;
}

.nav-link {
  position: relative;
  padding: 0.5rem 0;
  color: var(--vp-c-text-2);
  transition: color 0.3s ease;
}

/* An underline that draws itself in from the left. */
.nav-link::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  background-color: currentColor;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s var(--ease-out);
}

.nav-link:hover,
.nav-link.active {
  color: var(--vp-c-text-1);
}

.nav-link:hover::after,
.nav-link.active::after {
  transform: scaleX(1);
}

.nav-link.active::after {
  background-color: var(--vp-c-brand-1);
}

.appearance {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  margin-right: -0.5rem;
  border-radius: 999px;
  color: var(--vp-c-text-2);
  transition:
    color 0.3s ease,
    background-color 0.3s ease,
    transform 0.5s var(--ease-out);
}

.appearance:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-default-soft);
  transform: rotate(-15deg);
}

.appearance svg {
  width: 1.125rem;
  height: 1.125rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.icon-sun,
:global(.dark) .icon-moon {
  display: none;
}

:global(.dark) .icon-sun {
  display: block;
}

@media (max-width: 30rem) {
  .site-header {
    gap: 1rem;
  }

  .nav {
    gap: 1rem;
  }

  .brand,
  .nav-link {
    letter-spacing: 0.08em;
  }
}
</style>

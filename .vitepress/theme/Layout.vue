<script setup lang="ts">
import { Content, useData } from 'vitepress'
import { computed } from 'vue'

import { getWritingSlug } from '../utils'
import SiteFooter from './components/SiteFooter.vue'
import SiteHeader from './components/SiteHeader.vue'
import WritingFooter from './components/WritingFooter.vue'
import { isPageTransition } from './page-transition'

const { page, frontmatter } = useData()

const isHome = computed(() => frontmatter.value.layout === 'home')
const isWritingPost = computed(() => getWritingSlug(page.value.relativePath) !== null)
</script>

<template>
  <div class="layout">
    <SiteHeader />

    <!-- Keyed per page so the entrance animations replay on navigation. -->
    <main :key="page.relativePath" class="main" :class="{ wide: isHome, 'page-transition': isPageTransition }">
      <div v-if="page.isNotFound" class="vp-doc not-found">
        <p class="not-found-code smallcaps">Page 404</p>
        <h1>This page wandered off</h1>
        <p>
          Whatever used to live here has moved, or maybe it never existed at all. Let's get you
          <a href="/">back home</a>.
        </p>
      </div>

      <template v-else>
        <Content class="vp-doc" :class="{ home: isHome, post: isWritingPost }" />
        <WritingFooter v-if="isWritingPost" />
      </template>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

.main {
  flex: 1;
  width: 100%;
  max-width: calc(var(--measure) + 2 * var(--gutter));
  margin: 0 auto;
  padding: 4rem var(--gutter) 6rem;
}

.main.wide {
  max-width: calc(var(--frame) + 2 * var(--gutter));
}

.not-found-code {
  margin: 0 0 0.75rem;
  color: var(--vp-c-text-3);
}
</style>

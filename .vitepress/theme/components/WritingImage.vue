<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'

// Frontmatter is plain data that Vite never sees, so the images sitting next to
// the posts are bundled here and looked up by path instead.
const images = import.meta.glob<string>('/writing/*/*.{avif,gif,jpeg,jpg,png,svg,webp}', {
  eager: true,
  import: 'default',
})

const { frontmatter, page } = useData()

const photo = computed<{ by?: string; href?: string; image?: string } | undefined>(() => frontmatter.value.photo)
// `photo.image` is relative to the post's own file, e.g. `./cover.jpg`.
const imagePath = computed(() => {
  const image = photo.value?.image
  if (!image) return undefined
  const { pathname } = new URL(image, `file:///${page.value.filePath}`)
  return images[decodeURI(pathname)]
})
const imageBy = computed(() => photo.value?.by)
const imageByHref = computed(() => photo.value?.href)
</script>

<template>
  <figure v-if="imagePath" class="writing-image">
    <img :src="imagePath" :alt="imageBy ? `Photo by ${imageBy}` : ''" />
    <figcaption v-if="imageBy" class="photo-by">
      Photo by
      <a v-if="imageByHref" :href="imageByHref" target="_blank" rel="noopener">{{ imageBy }}</a>
      <span v-else>{{ imageBy }}</span>
    </figcaption>
  </figure>
</template>

<style scoped>
.writing-image {
  margin: 2.5rem 0 3rem;
}

.writing-image img {
  width: 100%;
  margin: 0;
  filter: sepia(0.12);
}

/* Wider than the text column, like a plate in a book. */
@media (min-width: 60rem) {
  .writing-image {
    margin-inline: -5rem;
  }
}

.photo-by {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  font-style: italic;
  text-align: center;
  color: var(--vp-c-text-3);
}

.photo-by a {
  color: inherit;
  text-decoration: none;
}

.photo-by a:hover {
  color: var(--vp-c-text-1);
  text-decoration: underline;
}
</style>

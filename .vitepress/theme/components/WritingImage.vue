<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'

const { frontmatter } = useData()

const photo = computed<{ by?: string, href?: string, image?: string } | undefined>(() => frontmatter.value.photo)
const imagePath = computed(() => photo.value?.image)
const imageBy = computed(() => photo.value?.by)
const imageByHref = computed(() => photo.value?.href)
</script>

<template>
  <div v-if="imagePath" class="writing-image">
    <img :src="imagePath" :alt="imageBy ? `Photo by ${imageBy}` : 'Writing image'">
    <p v-if="imageBy" class="photo-by">
      Photo by
      <a v-if="imageByHref" :href="imageByHref" target="_blank" rel="noopener">{{ imageBy }}</a>
      <span v-else>{{ imageBy }}</span>
    </p>
  </div>
</template>

<style scoped>
.writing-image {
  text-align: center;
}

.writing-image img {
  width: 100%;
}

.photo-by {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.photo-by a {
  text-decoration: none;
}

.photo-by a:hover {
  text-decoration: underline;
}
</style>

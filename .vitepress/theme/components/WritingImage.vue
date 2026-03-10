<script setup lang="ts">
defineProps({
  imagePath: String,
  imageBy: String,
  imageByHref: String,
})
</script>

<template>
  <div class="writing-image">
    <img :src="imagePath" :alt="`Photo by ${imageBy}`">
    <p class="photo-by">
      Photo by
      <a :href="imageByHref" target="_blank" rel="noopener">{{ imageBy }}</a>
    </p>
  </div>
</template>

<style scoped>
.writing-image {
  margin: 2rem auto;
  max-width: 600px;
  text-align: center;
}

.writing-image img {
  width: 100%;
  border-radius: 8px;
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

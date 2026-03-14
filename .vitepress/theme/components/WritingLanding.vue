<script setup lang="ts">
import writings from './writings.json'
</script>

<template>
  <div class="writing-landing">
    <a
      v-for="writing in writings"
      :key="writing.writingSlug"
      :href="`/writing/${writing.writingSlug}`"
      class="writing"
    >
      <img :src="writing.photo.image" :alt="writing.photo.by">
      <span>{{ writing.title }}</span>
    </a>
  </div>
</template>

<style scoped>
.writing-landing {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.writing {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  padding: 0.5rem;
  border: 1px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  color: var(--vp-c-text-1);
  transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.writing img {
  width: 100%;
  height: 180px;
  border-radius: 6px;
  object-fit: cover;
}

.writing span {
  padding-top: 1rem;
}

.writing:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  transform: translateY(-4px);
}
</style>

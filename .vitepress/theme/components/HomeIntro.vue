<script setup lang="ts">
import { useData } from 'vitepress'
import { computed } from 'vue'

const { site } = useData()

// Split the name into letters so each one can settle in on its own beat.
// The stagger itself is pure CSS (`sibling-index()`).
const words = computed(() => site.value.title.split(' ').map(word => Array.from(word)))
</script>

<template>
  <section class="home-intro">
    <div class="intro-text">
      <h1 class="name" :aria-label="site.title">
        <template v-for="(word, w) in words" :key="w">
          <span class="word" aria-hidden="true">
            <span v-for="(letter, l) in word" :key="l" class="letter">{{ letter }}</span>
          </span>
          <!-- A real space, so a wrapped second line starts flush left. -->
          {{ w < words.length - 1 ? ' ' : '' }}
        </template>
      </h1>

      <div class="lede">
        <slot />
      </div>
    </div>

    <figure class="portrait">
      <img src="/profile.png" alt="Ahmet Tınastepe" width="512" height="512" />
    </figure>
  </section>
</template>

<style scoped>
.home-intro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16rem;
  align-items: center;
  gap: 4rem;
}

.name {
  margin: 0 0 1.75rem;
  font-size: clamp(2.75rem, 1.5rem + 4.5vw, 4.5rem);
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.03em;
}

/* Registered so `sibling-index()` is resolved on the word itself and then
   inherited by its letters; an unregistered property would be evaluated on
   each letter instead. */
@property --word-index {
  syntax: '<integer>';
  inherits: true;
  initial-value: 1;
}

.word {
  --word-index: sibling-index();
  display: inline-block;
  white-space: nowrap;
}

/* Letters are numbered within their word, so each word starts six beats after
   the previous one (five letters plus a pause). Browsers without
   `sibling-index()` drop the second delay and animate the letters together. */
.letter {
  display: inline-block;
  animation: ink 0.9s var(--ease-out) both;
  animation-delay: 150ms;
  animation-delay: calc(150ms + ((var(--word-index) - 1) * 6 + sibling-index() - 1) * 45ms);
  will-change: transform, filter;
}

.lede :deep(p) {
  margin: 0 0 1rem;
  font-size: 1.3125rem;
  line-height: 1.6;
  animation: rise 0.9s var(--ease-out) both;
  animation-delay: 0.7s;
  animation-delay: calc(0.6s + sibling-index() * 0.1s);
}

.lede :deep(p + p) {
  color: var(--vp-c-text-2);
}

.portrait {
  margin: 0;
  animation: develop 1.6s var(--ease-out) 0.3s both;
}

.portrait img {
  width: 100%;
  height: auto;
  margin: 0;
  border-radius: 50%;
  filter: sepia(0.25) contrast(1.02);
  box-shadow:
    0 0 0 1px var(--vp-c-divider),
    0 18px 40px -18px rgba(42, 33, 24, 0.45);
}

@media (max-width: 48rem) {
  .home-intro {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .portrait {
    order: -1;
    width: 10rem;
  }
}
</style>

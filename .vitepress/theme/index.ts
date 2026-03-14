import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import WritingImage from './components/WritingImage.vue'
import WritingLanding from './components/WritingLanding.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app }) {
    app.component('WritingLanding', WritingLanding)
    app.component('WritingImage', WritingImage)
  },
} satisfies Theme

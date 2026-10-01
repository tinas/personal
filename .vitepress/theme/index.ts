import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme-without-fonts'

import HomeIntro from './components/HomeIntro.vue'
import WritingImage from './components/WritingImage.vue'
import WritingList from './components/WritingList.vue'
import WritingMeta from './components/WritingMeta.vue'
import Layout from './Layout.vue'

import '@fontsource-variable/literata/opsz.css'
import '@fontsource-variable/literata/opsz-italic.css'
import '@fontsource-variable/geist-mono/wght.css'
import './style.css'

// https://vitepress.dev/guide/custom-theme
// Extending the default theme keeps its markdown styles (code blocks, code
// groups, custom containers) while the page chrome comes from our own Layout.
export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('HomeIntro', HomeIntro)
    app.component('WritingImage', WritingImage)
    app.component('WritingList', WritingList)
    app.component('WritingMeta', WritingMeta)
  },
} satisfies Theme

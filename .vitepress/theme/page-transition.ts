import type { Router } from 'vitepress'
import { inBrowser } from 'vitepress'
import { nextTick, ref } from 'vue'

import { getWritingSlug } from '../utils'

const HTML_EXTENSION_REGEX = /\.html$/

/** Whether the current page was entered through a page transition. */
export const isPageTransition = ref(false)

/**
 * The post whose title glides between the writing list and the post itself:
 * the one being opened, or else the one being left.
 */
export const transitionSlug = ref<string | null>(null)

function slugOf(href: string): string | null {
  const { pathname } = new URL(href, location.href)
  return getWritingSlug(`${decodeURI(pathname).slice(1).replace(HTML_EXTENSION_REGEX, '')}.md`)
}

/**
 * Runs client-side navigations as a view transition: the page cross-fades
 * while a post's title glides into place (see style.css).
 */
export function setupPageTransitions(router: Router) {
  if (!inBrowser) return

  let finishUpdate: (() => void) | undefined

  router.onAfterPageLoad = async href => {
    // The first page load has nothing to transition from.
    const isNavigation = router.route.component !== null
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    isPageTransition.value = isNavigation && Boolean(document.startViewTransition) && !reduceMotion
    transitionSlug.value = isPageTransition.value
      ? (slugOf(href) ?? getWritingSlug(router.route.data.relativePath))
      : null
    if (!isPageTransition.value) return

    // Names the list entry before the old page is captured.
    await nextTick()

    finishUpdate?.()
    await new Promise<void>(startUpdate => {
      document.startViewTransition(
        () =>
          new Promise<void>(resolve => {
            finishUpdate = resolve
            startUpdate()
          }),
      )
    })
  }

  // The router swaps the page and restores the scroll right after the hook
  // above, so the new page is in place once that has rendered.
  router.onAfterRouteChange = async () => {
    await nextTick()
    finishUpdate?.()
    finishUpdate = undefined
  }
}

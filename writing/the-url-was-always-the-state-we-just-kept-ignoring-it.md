---
title: The URL was always the state, we just kept ignoring it
description: A new composable for syncing URL parameters with reactive state in Vue.
date: 2026-03-14
photo:
  by: Javier Allegue Barros
  href: https://unsplash.com/@soymeraki
  image: /writing/the-url-was-always-the-state-we-just-kept-ignoring-it.jpg
head:
  - - meta
    - property: og:title
      content: The URL was always the state, we just kept ignoring it
  - - meta
    - property: og:description
      content: A new composable for syncing URL parameters with reactive state in Vue.
  - - meta
    - property: og:image
      content: https://www.tinas.dev/og/the-url-was-always-the-state-we-just-kept-ignoring-it.jpg
  - - meta
    - property: og:url
      content: https://www.tinas.dev/writing/the-url-was-always-the-state-we-just-kept-ignoring-it
  - - meta
    - property: og:type
      content: article
  - - meta
    - name: twitter:title
      content: The URL was always the state, we just kept ignoring it
  - - meta
    - name: twitter:description
      content: A new composable for syncing URL parameters with reactive state in Vue.
  - - meta
    - name: twitter:image
      content: https://www.tinas.dev/og/the-url-was-always-the-state-we-just-kept-ignoring-it.jpg
---

# The URL was always the state, we just kept ignoring it

<WritingMeta />

<WritingImage />

Every Vue app eventually has *that* moment. You build a product listing page with filters, sorting, pagination, the works. It feels great. Then someone shares the link, the other person opens it, and everything is gone. All that carefully managed state lived in a `ref()` somewhere in memory, not in the URL where it actually belonged.

So you do the responsible thing: you start syncing state with `route.query`. You write a watcher. Then another one. Then you realize `route.query.page` is a string and your pagination logic just did `"2" + 1 = "21"`. You add `parseInt`. A fallback. Another watcher for the back button. Forty lines later, you have a working page parameter and you haven't even started on `sort`.

To be fair, the title is intentionally dramatic. URL is not where all app state should live: it only carries strings, and browsers/servers impose practical URL length limits. So the right target is shareable, navigable UI state (like filters, sorting, pagination), not large or sensitive data.

I got tired of writing that code. So I wrote [qpick](https://github.com/tinas/qpick)

## What's in a Name?

The name comes from **q** (query) and **pick**, as in cherry-picking the exact parameters you need from the URL. I wanted something short enough that you wouldn't resent typing it in every import statement, and honest enough that you'd know what it does before reading a single line of documentation. You pick query params, you get reactive state.

## So What Does It Actually Do?

qpick gives you a single composable, `useRouteState`, that turns URL parameters into writable, type-safe, reactive refs. If you've ever used `ref()` in Vue, you already know how to use qpick. The only difference is that the source of truth lives in the address bar instead of component memory.

```ts
import { parseAsInteger, useRouteState } from 'qpick'

const page = useRouteState({ key: 'page', parser: parseAsInteger.default(1) }) // [!code highlight]
// page.value is a number. Always. Never null, never "2", never undefined.
// Setting page.value = 3 navigates to ?page=3.
// Hitting the back button sets it back. Reactively.
```

That's not pseudocode, it's the actual API. No setup ceremony beyond what you already have with `vue-router`, no plugin registration required.

## Why I Built This

I went looking for something like this in the Vue ecosystem and came up mostly empty. The React world has [nuqs](https://nuqs.47ng.com/), which nails this problem with a clean, composable-driven approach. Vue had router utilities, state management libraries that could optionally sync with the URL, but nothing that treated URL parameters as first-class reactive primitives with the same ergonomics you'd expect from a plain `ref()`.

I wanted something that feels like writing normal Vue code, with an API that looks and behaves like JavaScript you already know. `parseAsInteger`, `parseAsFloat`, `parseAsBoolean`... if you've used `parseInt` or `parseFloat` before, the naming and mental model are immediately familiar. Declare what you need from the URL, get a ref back, wire it up with `v-model`, and move on with your day.

## Parsers, or: How to Stop Worrying About Strings

The thing that makes all of this work is the parser system. URLs only speak strings, but your app thinks in numbers, booleans, arrays, dates, and union types. Parsers handle the translation in both directions, and they carry their types with them:

```ts
const search = useRouteState({ key: 'q' })
// string | null

const page = useRouteState({ key: 'page', parser: parseAsInteger.default(1) })
// number, parsed, typed, guaranteed non-null

const sort = useRouteState({
  key: 'sort',
  parser: parseAsStringLiteral(['price', 'name', 'rating']).default('price'),
})
// 'price' | 'name' | 'rating', narrowed at the type level
```

Every parser has a `.default()` method that does two things at once: it guarantees a non-null type so you can stop writing `page ?? 1` everywhere, and it keeps the URL clean by stripping the parameter when the value matches the default. A page in its default state gets a clean URL, no `?page=1&sort=price&inStock=true` clutter.

qpick ships with parsers for the common cases like `parseAsFloat`, `parseAsBoolean`, `parseAsDate`, `parseAsArrayOf`, and `parseAsJson`, but the one I find myself reaching for constantly is `parseAsStringLiteral`. It gives you runtime validation and TypeScript type narrowing from a single declaration. If someone manually types `?sort=banana` into the address bar, the value quietly falls back to the default instead of propagating nonsense through your app.

When the built-ins don't cover your case, `createParser` lets you bring your own types:

```ts
const parseAsPriceRange = createParser<{ min: number, max: number }>({
  parse(value) {
    const [min, max] = value.split('-').map(Number)
    return (Number.isNaN(min) || Number.isNaN(max)) ? null : { min, max }
  },
  serialize(value) {
    return `${value.min}-${value.max}`
  },
  eq(a, b) {
    return a.min === b.min && a.max === b.max
  },
})

// ?price=50-200 → { min: 50, max: 200 }
```

Same pattern, same guarantees, your own domain types.

## More Than One Parameter

Most pages you'll work on have several URL parameters that need to stay in sync. qpick handles this by accepting an array of configs and returning an object of refs:

```ts
const filters = useRouteState([
  { key: 'q', parser: parseAsString.default('') },
  { key: 'page', parser: parseAsInteger.default(1) },
  { key: 'sort', parser: parseAsStringLiteral(['price', 'name', 'rating']).default('price') },
  { key: 'categories', parser: parseAsArrayOf(parseAsString).default([]) },
])
```

Each key becomes a reactive ref: `filters.q.value`, `filters.page.value`, and so on. But here's the part that matters. When your user types a new search query, you probably want to reset to page 1. If you set `filters.q.value` and `filters.page.value` separately, that's two router navigations, two history entries, and a flash of intermediate state that nobody asked for. So instead:

```ts
filters.set({ q: 'headphones', page: 1 })
```

One navigation. One history entry. No intermediate flicker. There's also `filters.reset()` to restore everything to defaults, and `filters.toObject()` when you need a plain object for an API call:

```ts
watch(() => filters.toObject(), (params) => {
  fetchProducts(params)
})
```

## Configs That Travel Between Components

If you've used [TanStack Query](https://tanstack.com/query), the pattern here might feel familiar. TanStack Query encourages you to define query options in a shared file so that any component can reference the same query without duplicating configuration. qpick borrows that idea for URL state: define your configs once, import them wherever you need them, and let the shared source of truth (in this case, the URL) keep everything in sync.

:::code-group
```ts [composables/states.ts]
export const searchState = routeStateOptions({
  key: 'search',
  parser: parseAsString.default(''),
  urlKey: 'q',
})

export const pageState = routeStateOptions({
  key: 'page',
  parser: parseAsInteger.default(1),
})
```
:::

Now `ProductList.vue` and `ProductPagination.vue` can both import `pageState`, call `useRouteState(pageState)`, and they stay in sync automatically. Not through a store or provide/inject or an event bus, but because they both read from and write to the same URL. Change the page in one component, the other one reacts. That's just how refs work when they share a source of truth.

## The Small Things That Add Up

Beyond the core API, there are a few design decisions that ended up mattering more than I expected in daily use.

`urlKey` remapping lets your code use `filters.search.value` while the URL shows `?q=...`. You get developer-friendly names in your components and user-friendly (or API-friendly) names in the address bar, without any disconnect between the two.

Path parameters work too. If your route is `/products/:id`, you can use `{ key: 'id', parser: parseAsInteger }` and qpick reads from `route.params` automatically. You can mix path and query params in the same `useRouteState` call, each with its own parser and default.

History mode is configurable per parameter. A search input should probably use `replace` since nobody wants 50 history entries from typing a word. A page change should use `push` because you want the back button to work. When you batch-update with `set()`, qpick resolves conflicts with a simple rule: push wins over replace, because losing a history entry is worse than gaining an extra one.

And the plugin is entirely optional. If you have `vue-router`, `useRouteState` works out of the box. The plugin only exists for cases where you want to override the global defaults.

## Give It a Spin

```bash
npm install qpick
```

The whole thing is one composable, a set of parsers, and a [README](https://github.com/tinas/qpick) that should get you running in a few minutes. If you've ever caught yourself manually syncing `route.query` with a ref and thought "there has to be a better way", I'd love for you to give it a try.

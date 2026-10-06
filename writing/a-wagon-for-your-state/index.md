---
title: A Wagon for Your State
description: How usewagen came to be, one package for reactive, type-safe state in the URL and in browser storage.
date: 2026-10-06
photo:
  by: Anirudh
  href: https://unsplash.com/@underroot
  image: ./cover.jpg
---

# A Wagon for Your State

<WritingMeta />

<WritingImage />

After publishing [qpick](https://npmx.dev/package/qpick), I started thinking about how I could extend it to storage. The URL and storage both only work with strings, so I wanted to solve the two of them in a single package. Why am I telling you this? The answer is [usewagen](https://usewagen.dev/), but let's unpack the details first.

It all came from the need to use state that lives in the URL or in storage inside my code, in a way that's both reactive and type-safe. I had used plenty of different solutions for that before. One of them read and wrote storage through a proxy, which let me step in between and handle parsing and serializing right there in the proxy.

Using it looked roughly like this:

```js
import { SESSION_STORAGE_KEYS } from '@/utils/storage'
import { createStorageManager } from '@/utils/storageManagerFactory'

const sessionStorageManager = createStorageManager(sessionStorage, SESSION_STORAGE_KEYS, {
  prefix: 'foo:',
  placeholderData: {
    lastSessionExpiredShown: false,
  },
})

// If not set, returns the placeholder
console.log(sessionStorageManager.lastSessionExpiredShown) // false

// Set a value
sessionStorageManager.lastSessionExpiredShown = true

// Delete a value
delete sessionStorageManager.lastSessionExpiredShown

// Clear all managed keys
sessionStorageManager.clear()
```

And here's roughly one of the solutions I came up with for the route:

```js
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const showLabels = computed({
  get: () => {
    const current = route.query.show_labels
    if (current === undefined) return true
    return current === 'true'
  },
  set: val => {
    router.replace({ query: { ...route.query, show_labels: String(val) } })
  },
})
```

That's just an example for a single boolean. When several params had to change at once, I used other approaches as well.

Then [VueUse](https://vueuse.org/) came along, and I tried using its composables in my projects. That wasn't enough either, because there were cases where I had to read and write some of this state outside an effect scope. Bit by bit, that's how qpick came about first. Its goal was quite simple. There's state in the route, and I want to read and write it type-safely.

I modeled the approach on [nuqs](https://nuqs.dev/). If you haven't heard of it, I highly recommend taking a look. Anyway, back to our topic.

After using the package for a while, I noticed some problems, and I also wanted the same solution for storage state. Route state, for example, had a race condition where two params written in the same tick could wipe each other out.

---

Before writing usewagen, I spent some time thinking about the API, because qpick already has a parser system inside it, and I wanted the route and storage composables to share that same parser system. My first idea was to publish them as separate packages and combine them, with a core package and adapter packages for Vue, React and so on. That would have worked for storage, but getting it to work for the router would have been tough. Besides, nuqs is already popular in the React ecosystem, and for good reason.

Another thing I wanted was for the parsers in a project to be collected automatically, so they could be used in composables just by their name. At first I had packages like `@aioli/core`, `@aioli/vue-route` and `@aioli/vue-storage` in mind. What's `aioli`, you ask? A burger sauce, actually 😄. I hadn't put much thought into the name back then. Clearly I was hungry.

The problem was that both adapter packages depended on core and re-exported its parsers, so `parseAsBoolean`, for example, could be imported from both the router and the storage package. And since both packages depended on core, their versions had to be kept in sync, otherwise core couldn't be deduped and the app could end up with two copies of it. On top of that, I wanted to write a Vite plugin that collects the parsers and makes them available across the project. And of course, the utility functions for creating custom parsers come from core as well.

---

Thinking about all of this, I decided to publish it as a single package. I can't really tell yet whether it will find its place in the community anyway, so I started building it to solve my own problem. It's still split on the inside. The parsers come from `usewagen`, while the composables and the Vite plugin live under `usewagen/router`, `usewagen/storage` and `usewagen/vite`. `vue-router` and `vite` are optional peer dependencies, so you only install what you use.

The goal is actually very simple. There's state in the route or in storage, I want to read and write it type-safely, and I want it to be reactive at the same time. That's exactly where the name came from. _Wagen_ apparently means wagon in German, something to carry your state around in. At first I tried to name it just `wagen`, but npm's name policy put the brakes on that, so I went with `usewagen`.

Soo, how do you _use_ usewagen?

It's very simple. Let's look at an example:

```ts
const route = useRoute()
const router = useRouter()

const page = ref(Number(route.query.page ?? 1))

watch(page, value => router.replace({ query: { ...route.query, page: String(value) } }))
watch(
  () => route.query.page,
  value => (page.value = Number(value ?? 1)),
)
```

With usewagen, the same logic can be written like this:

```ts
import { parseAsInteger } from 'usewagen'
import { useRouteState } from 'usewagen/router'

const page = useRouteState({ key: 'page', parser: parseAsInteger.withDefault(1) })
```

Custom parsers can be written like this:

```ts
import { defineParser } from 'usewagen'

export const parseAsSlug = defineParser<string>({
  parse: raw => (/^[a-z0-9-]+$/.test(raw) ? raw : null),
})
```

And used directly like this:

```ts
const slug = useRouteState({ key: 'slug', parser: parseAsSlug })
```

To use them by name, they need to be registered first. This is where the Vite plugin comes in. It collects the parsers in a folder and serves them from a virtual module that you hand to `createWagen`.

:::code-group
```ts [vite.config.ts]
import { usewagen } from 'usewagen/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [usewagen({ dirs: 'src/parsers' })],
})
```

```ts [main.ts]
import { createWagen } from 'usewagen'
import { parsers } from 'virtual:usewagen/parsers'
import { createApp } from 'vue'

import App from './App.vue'

const wagen = createWagen({ parsers })

createApp(App).use(wagen).mount('#app')
```
:::

After that, the name is enough:

```ts
// by name
const slug = useRouteState({ key: 'slug', parser: { name: 'parseAsSlug' } })

// with a default value (parseAsSort being another parser in src/parsers)
const sort = useRouteState({ key: 'sort', parser: { name: 'parseAsSort', defaultValue: 'asc' } })
```

You can also create as many scoped storages as you like:

```ts
import { createLocalStorage, createMemoryStorage, createSessionStorage } from 'usewagen/storage'

const local = createLocalStorage({ prefix: 'app:' })
const memory = createMemoryStorage()
```

Maybe you need a storage for tests? Here it is! `createMemoryStorage` keeps everything in a `Map`, and you can hand it to a single state or to `createWagen` for the whole app. And if you need a store of your own, `createStorage` takes four functions and gives you the same API:

```ts
import { createStorage } from 'usewagen/storage'

const store = new Map<string, string>()

const shared = createStorage('shared', {
  getItem: key => store.get(key) ?? null,
  setItem: (key, value) => void store.set(key, value),
  removeItem: key => void store.delete(key),
  keys: () => [...store.keys()],
  prefix: 'app:',
})
```

And that's how usewagen was born. If I'm honest, it's less an invention than a reunion of every solution I'd tried before, rethought and finally heading in the same direction.

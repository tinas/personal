---
title: How Five Minutes at MadVue Reshaped qpick's API
description: How a five-minute conversation at MadVue led to removing eq from qpick's parser system and embracing idempotency.
date: 2026-05-26
photo:
  by: Victor
  href: https://unsplash.com/@victor_g
  image: /writing/how-five-minutes-at-madvue-reshaped-qpick-api.jpg
head:
  - - meta
    - property: og:title
      content: How Five Minutes at MadVue Reshaped qpick's API
  - - meta
    - property: og:description
      content: How a five-minute conversation at MadVue led to removing eq from qpick's parser system and embracing idempotency.
  - - meta
    - property: og:image
      content: https://www.tinas.dev/og/how-five-minutes-at-madvue-reshaped-qpick-api.jpg
  - - meta
    - property: og:url
      content: https://www.tinas.dev/writing/how-five-minutes-at-madvue-reshaped-qpick-api
  - - meta
    - property: og:type
      content: article
  - - meta
    - name: twitter:title
      content: How Five Minutes at MadVue Reshaped qpick's API
  - - meta
    - name: twitter:description
      content: How a five-minute conversation at MadVue led to removing eq from qpick's parser system and embracing idempotency.
  - - meta
    - name: twitter:image
      content: https://www.tinas.dev/og/how-five-minutes-at-madvue-reshaped-qpick-api.jpg
---

# How Five Minutes at MadVue Reshaped qpick's API

<WritingMeta />

<WritingImage />

Last week I attended [MadVue](https://madvue.es/) in Madrid. The talks covered everything from AI agent strategies to Vite 8, Oxc, module federation, and WebRTC. A full day well spent. But this post isn't about any of those.

It's about a five-minute conversation that changed how [qpick](https://github.com/tinas/qpick) works.

## The Conversation

I'd been wanting to get feedback on qpick from [Eduardo](https://bsky.app/profile/esm.dev) (the author and maintainer of vue-router and pinia). He pulled up the docs, read through them for a few minutes, and pointed at something I'd completely overlooked: **idempotency**.

I'd spent so much time thinking about reactivity that I missed something equally fundamental to a URL parser library. When you parse a value from the URL and serialize it back, you should get the same string. Always. And if you parse *that* string again, you should get the same value. No matter how many times you repeat the cycle.

## What the Spec Says

If you look at the [URL Standard's goals](https://url.spec.whatwg.org/#goals), idempotency is stated explicitly:

> Ensure the combination of parser, serializer, and API guarantee idempotence. For example, a non-failure result of a parse-then-serialize operation will not change with any further parse-then-serialize operations applied to it. Similarly, manipulating a non-failure result through the API will not change from applying any number of serialize-then-parse operations to it.

A simple way to think about this: `Math.abs()` is an idempotent function.

```ts
Math.abs(Math.abs(-5)) === Math.abs(-5) // true — applying it twice is the same as once
```

For a URL parser, the equivalent guarantee is:

```ts
parse(serialize(parse(str))) === parse(str)
```

No matter how many round-trips you do, the value stabilizes after the first successful parse.

## Removing `eq`

The first thing I did was remove the `eq` function from the parser config:

```ts
export type ParserConfig<T> = {
  parse: (value: string) => T | null
  serialize: (value: T) => string
  eq?: (a: T, b: T) => boolean // [!code --]
}
```

The `eq` function existed for one reason: deciding whether a parameter should be cleared from the URL (i.e., whether the current value equals the default). But once you enforce idempotent serialization, you don't need a separate equality function. Two values are "equal" for URL purposes if and only if they serialize to the same string:

```ts
function shouldClear<T>(parser: Parser<T>, value: T, clearOnDefault: boolean): boolean {
  // ...
  const eq = parser.eq ?? ((a: T, b: T) => a === b) // [!code --]
  return eq(value, def) // [!code --]
  return parser.serialize(value) === parser.serialize(def) // [!code ++]
}
```

This is simpler and more correct. If your serializer is idempotent, comparing serialized output is the canonical way to check equality. No custom `eq` needed.

## Naming Conventions

I also renamed `createParser` to `defineParser` to align with Vue ecosystem conventions (`defineComponent`, `defineStore`, `defineEmits`...). Small change, but it makes the API feel more at home in a Vue project.

## The New API

Here's what a custom parser looks like in alpha-2:

```ts
type HexColor = number // 0x000000–0xFFFFFF

const parseAsHexColor = defineParser<HexColor>({
  parse(v) {
    const parsedValue = Number.parseInt(v, 16)
    if (Number.isNaN(parsedValue)) {
      return null
    }
    return parsedValue
  },
  serialize: v => v.toString(16).padStart(6, '0'),
})
// ?color=ff5733 → 16734003
```

No `eq` to define. The only contract you need to uphold is that `parse` and `serialize` are inverses of each other, so that round-tripping always produces stable results.

## Why Conferences Still Matter

This change came from a five-minute hallway conversation. I could have stared at the code for weeks and not seen it, because I was too close to it, thinking in terms of reactivity and Vue internals instead of stepping back to ask "what guarantees should a URL parser provide?"

That's what events like MadVue give you. A different set of eyes, a different frame of reference, and access to people who've been thinking about these problems longer than you have. Oh, and apparently we were the first Turkish attendees in MadVue's history. 😅

You can find all the **alpha-2** changes on [GitHub](https://github.com/tinas/qpick/blob/main/CHANGELOG.md#v100-alpha2).

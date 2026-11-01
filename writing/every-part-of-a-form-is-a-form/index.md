---
title: Every Part of a Form Is a Form
description: Why I wrote formtree, a form library that starts from the parts of a form instead of its root.
date: 2026-11-01
photo:
  by: Manuel Sardo
  href: https://unsplash.com/@manuelsardo
  image: ./cover.jpg
---

# Every Part of a Form Is a Form

<WritingMeta />

<WritingImage />

There's a composable at work that saves one row of a list, and it opens with a TODO. Roughly, it asks to revisit the complexity of the file, because it validates and saves each row by stitching things together by hand. Every time I opened that file, the comment was right. [formtree](https://form-tree.netlify.app) started as my answer to it, and this post is about why it became a library of its own instead of a few helpers on top of what we already had.

I'll tell it through an event form instead of the real one, but the story is the same.

Creating an event takes four steps, from the details and tickets to payout and publishing. Payout details only matter for paid events. Once the event exists, its ticket types are edited and saved one at a time, and its capacity can be changed right in the events table. The rules are the same everywhere, but most of the time, what gets saved isn't the whole form. It's a step, a row, a single number.

---

Form libraries are popular for good reasons. vee-validate, React Hook Form, TanStack Form and FormKit are mature and well documented, and they handle the forms most apps have, like a login, a sign-up or a contact page, really well. We use vee-validate, and I'm not here to tell you it's bad.

But they all share one assumption. A form is one thing, and it's submitted from the root. Fields register into it, rules attach to it, and submit validates all of it. The parts exist, as nested objects in the value or as field groups in the UI, but they're views into the root, not forms of their own.

That assumption is invisible until your form stops behaving like one thing. Then every part that wants to act on its own needs a workaround.

- Saving one ticket row means picking its fields, validating them one by one and resetting just that row by hand. That's what the TODO was about.
- Payout fields only apply to paid events, so the schema grows a "required, but only when…" refinement, the fields watch the event type to clear themselves, and the payload still sends everything.
- Going back a step unmounts its fields, and their values can go with them, so the steps keep them alive with an option and a copy in a store.
- The capacity cell in the table lived outside the form library entirely, so it had no validation at all. The rule existed in the wizard, the cell just didn't have it.

None of these is a big deal on its own. But they all point at the same place, because the library thinks in roots while the product thinks in parts.

---

Still, being annoyed isn't a reason to write a library, especially in a space this crowded. Before writing anything, I made myself answer one question. Is this a real gap, or did I just want something new?

So I looked for someone who had already solved it. Some had solved pieces. TanStack Form added form groups that can submit on their own. FormKit separates validating from showing errors. Angular's Signal Forms can submit a subtree and hide branches, and it's the closest thing I found, but it's Angular only. What I couldn't find was a library where the parts weren't an extra feature on top of the root, but the starting point.

My first attempt tried to have it both ways. It kept a single root schema, the way our forms already worked, and added scopes on top of it, little windows into the root that were found by their path. It didn't hold. A part couldn't give me its own parsed value, because a schema only runs as a whole. Its types still came from the root, so every path was checked against one giant union of the whole form. And in a nested tree, there was no good place to attach a rule deep inside. In the end, every wall came from the same place. The root owned everything, so the parts couldn't own anything.

That's when it clicked that the model itself had to flip. You can't get parts-first by bolting scopes onto a root-first form. So I deleted it and started over.

---

The idea came from routing, of all places. In [TanStack Router](https://tanstack.com/router), routes are defined separately from the router, each route carries its own schema, context flows down from parent to child, and types are computed per route instead of for the whole app. Nobody builds an app as one giant route and then carves pages out of it. So why do we build forms that way?

In formtree, a form is a tree of definitions. A definition describes one part of the form, with its schema, its rules and its children. It holds no state, so the same definition can be used anywhere. The form turns the tree into one state, and every position in it, the root, a step, a row or a single field, validates and submits the same way the whole form does.

<figure style="margin: 2.5rem 0">
<svg viewBox="0 0 420 568" role="img" aria-label="Two trees of the same event form. Root-first: only the root submits, saving a ticket row is hand-built, payout values are lost on unmount and the table cell has no rules. Parts-first: every node submits, the payout branch is off but kept, and the table cell uses the same capacity definition." style="display: block; width: 100%; max-width: 28rem; height: auto; margin: 0 auto; font-family: var(--vp-font-family-mono); font-size: 13px">
<text x="12" y="20" style="font-family: var(--vp-font-family-base); font-size: 14px; font-weight: 600; fill: currentColor">Root-first · one form, one submit</text>
<path d="M18 58 V160 M18 76 H34 M18 132 H34 M18 160 H34 M46 86 V104 H62 M46 170 V216 M46 188 H62 M46 216 H62" style="fill: none; stroke: var(--vp-c-border)" />
<g style="fill: currentColor">
<text x="12" y="52">event form</text>
<text x="40" y="80">details</text>
<text x="68" y="108">capacity</text>
<text x="40" y="136">payout</text>
<text x="40" y="164">tickets</text>
<text x="68" y="192">ticket 1</text>
<text x="68" y="220">ticket 2</text>
<text x="12" y="256"><tspan style="fill: var(--vp-c-text-3)">table cell · </tspan>capacity</text>
</g>
<g text-anchor="end" style="font-size: 11px; font-style: italic; fill: var(--vp-c-text-3)">
<text x="338" y="136">lost on unmount</text>
<text x="338" y="192">hand-built</text>
<text x="338" y="256">no rules</text>
</g>
<rect x="348" y="37.5" width="60" height="20" rx="10" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1)" />
<text x="378" y="51.5" text-anchor="middle" style="font-size: 11px; fill: var(--vp-c-brand-1)">submit</text>
<rect x="348" y="177.5" width="60" height="20" rx="10" stroke-dasharray="3 3" style="fill: none; stroke: var(--vp-c-text-3)" />
<text x="378" y="191.5" text-anchor="middle" style="font-size: 11px; fill: var(--vp-c-text-2)">save</text>
<line x1="0" y1="282" x2="420" y2="282" style="stroke: var(--vp-c-divider)" />
<text x="12" y="312" style="font-family: var(--vp-font-family-base); font-size: 14px; font-weight: 600; fill: currentColor">Parts-first · every part is a form</text>
<path d="M18 350 V452 M18 368 H34 M18 424 H34 M18 452 H34 M46 378 V396 H62 M46 462 V508 M46 480 H62 M46 508 H62" style="fill: none; stroke: var(--vp-c-border)" />
<g style="fill: currentColor">
<text x="12" y="344">event form</text>
<text x="40" y="372">details</text>
<text x="68" y="400">capacity</text>
<text x="40" y="428">payout</text>
<text x="40" y="456">tickets</text>
<text x="68" y="484">ticket 1</text>
<text x="68" y="512">ticket 2</text>
<text x="12" y="548"><tspan style="fill: var(--vp-c-text-3)">table cell · </tspan>capacity</text>
</g>
<path d="M136 396 H186 Q196 396 196 406 V534 Q196 544 186 544 H182" stroke-dasharray="4 3" style="fill: none; stroke: var(--vp-c-brand-1)" />
<g text-anchor="end" style="font-size: 11px; font-style: italic; fill: var(--vp-c-text-3)">
<text x="338" y="428">off · kept, not sent</text>
</g>
<text x="204" y="474" style="font-size: 11px; font-style: italic; fill: var(--vp-c-brand-1)">same definition</text>
<g style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1)">
<rect x="348" y="329.5" width="60" height="20" rx="10" />
<rect x="348" y="357.5" width="60" height="20" rx="10" />
<rect x="348" y="385.5" width="60" height="20" rx="10" />
<rect x="348" y="413.5" width="60" height="20" rx="10" />
<rect x="348" y="441.5" width="60" height="20" rx="10" />
<rect x="348" y="469.5" width="60" height="20" rx="10" />
<rect x="348" y="497.5" width="60" height="20" rx="10" />
<rect x="348" y="533.5" width="60" height="20" rx="10" />
</g>
<g text-anchor="middle" style="font-size: 11px; fill: var(--vp-c-brand-1)">
<text x="378" y="343.5">submit</text>
<text x="378" y="371.5">submit</text>
<text x="378" y="399.5">submit</text>
<text x="378" y="427.5">submit</text>
<text x="378" y="455.5">submit</text>
<text x="378" y="483.5">submit</text>
<text x="378" y="511.5">submit</text>
<text x="378" y="547.5">submit</text>
</g>
</svg>
<figcaption style="margin-top: 1rem; font-size: 0.875rem; font-style: italic; text-align: center; color: var(--vp-c-text-3)">The same event form, two models. Root-first, only the root submits. Parts-first, every part does, and the table cell reuses the capacity rule.</figcaption>
</figure>

In code, every level uses the same call.

```ts
form.handleSubmit(publishEvent)
form.group('payout').handleSubmit(savePayout)
form.array('tickets').items[0].handleSubmit(saveTicket)
```

Most of what makes formtree different follows from that one decision.

**Rules belong to the part, not to the screen.** Because a definition holds no state, the capacity rule is written once, and the wizard, the edit page and the table cell all use it. A single field can be the root of its own form, so the table cell gets the same rule without dragging the whole event form along.

**State doesn't follow the screen.** When fields register as their inputs mount, what happens to a value on unmount becomes a setting you have to remember. In formtree, mounting and unmounting change nothing. Payout isn't a `v-if` that throws values away, it's a branch switched off by data. A switched-off branch isn't validated and isn't sent, but what the user typed is still there when they come back.

**Types come from the part.** A part takes its type from its own definition instead of a union of every path in the form. A component that renders the payout step knows the payout definition and nothing about the event around it, and big or nested forms stay typed without making the compiler sweat.

**No guessing.** What happens on unmount? Does a server error survive the next validation? What does "empty" mean? Libraries often answer these with an option, or with a guess about what you meant. I wanted each of them to have one written rule, so I wrote them down before writing any code. They're in the docs as the [design rules](https://form-tree.netlify.app/guide/design-rules).

---

The good news is that trying it doesn't mean switching libraries. Any definition can be the root of its own form, and the Vue and React adapters need no app-wide setup, so formtree can start in a single component next to whatever you use today. Pick the form that keeps collecting workarounds, maybe one that's saved in parts or changes shape, or start even smaller with a single cell in a table. That's where the difference shows up fast. A login form won't change much, and that's fine, because the library you already have is great at those.

It's still an alpha, which also makes this the best time to shape it. The [docs](https://form-tree.netlify.app) have live examples you can play with right in the browser, and if something feels off or missing, I'd really like to hear about it on [GitHub](https://github.com/tinas/formtree).

As for that TODO, it's still there. Trying formtree on the form that started all of this is next on my list, and if that comment finally gets to go, I'll call it a win.

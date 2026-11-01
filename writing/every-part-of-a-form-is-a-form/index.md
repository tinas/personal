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

There's a composable at work that saves one row of a list, and it starts with a TODO asking to revisit how complex the file is. The comment is right. To save a single row, the file picks the row's fields, validates them one by one and resets them by hand. [formtree](https://form-tree.netlify.app) began as my answer to that TODO, and this post is about why the answer turned into a library instead of a few helpers.

I'll tell it through an event form instead of the real one, but the problems are the same.

Creating an event takes four steps, from the details and tickets to payout and publishing, and payout only matters for paid events. Once the event exists, each ticket type is edited and saved on its own, and the capacity can be changed right in the events table. So most of the time, what gets saved isn't the whole form. It's a step, a row or a single number.

---

Form libraries are popular for good reasons. vee-validate, React Hook Form, TanStack Form and FormKit are mature, well documented and great at the forms most apps have, like a login, a sign-up or a contact page. We use vee-validate at work, and this post isn't about it being bad.

They do share one assumption, though. A form is one thing, and it's submitted from the root. Fields register into it, rules attach to it, and a submit validates all of it. The parts exist, as nested objects or field groups, but they're windows into the root rather than forms of their own.

You don't notice that assumption until your form stops being one thing, and then every part that wants to act alone needs a workaround. The ticket row gets the hand-written validation from the TODO. Payout gets a "required, but only for paid events" refinement and watchers that clear its fields, and the payload still sends them. Going back a step unmounts its fields, so their values need a copy in a store to survive. And the capacity cell sits outside the form library altogether, without the rule the wizard has.

None of these is a big deal on its own. Together they point at one mismatch, because the library thinks in roots while the product thinks in parts.

---

Still, being annoyed isn't a reason to write a library, least of all in a space this crowded. Before writing anything, I asked myself whether this was a real gap or whether I just wanted something new.

Some libraries had solved pieces of it. TanStack Form can submit a group of fields on its own, FormKit separates validating from showing errors, and Angular's Signal Forms, the closest of them, can submit a subtree and switch branches off. But each of them adds parts on top of the root. None of them starts from the parts.

My first attempt tried to have it both ways. It kept one root schema and added scopes on top, little windows into the root found by their path. It didn't hold up. A scope couldn't get its own parsed value, because a schema only runs as a whole, its types still came from one huge union of the form, and a nested tree had no good place for a rule. Every wall came from the same place. The root owned everything, so the parts couldn't own anything.

So I deleted it and started over, this time from the parts.

---

The idea came from routing, of all places. In [TanStack Router](https://tanstack.com/router), each route is defined on its own with its own schema, context flows from parent to child, and types are computed per route instead of for the whole app. Nobody builds an app as one giant route and carves the pages out of it later. Why do we build forms that way?

In formtree, a form is a tree of definitions. A definition describes one part of the form with its schema, rules and children. It holds no state, so the same definition can be used anywhere. The form turns the tree into one state, and every position in it, from the root down to a single field, validates and submits the way the whole form does.

<figure style="margin: 2.5rem 0">
<svg viewBox="0 0 420 588" role="img" aria-label="Two trees of the same event form. Root-first: only the root submits, saving a ticket row is hand-built, payout values are lost on unmount and the table cell has no rules. Parts-first: the root submits the whole form and every other node submits its own part, the payout branch is off, so its submit does nothing while its values are kept, and the table cell is a whole form of its own, built from the same capacity definition." style="display: block; width: 100%; max-width: 28rem; height: auto; margin: 0 auto; font-family: var(--vp-font-family-mono); font-size: 13px">
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
<text x="12" y="264"><tspan style="fill: var(--vp-c-text-3)">table cell · </tspan>capacity</text>
</g>
<rect x="4" y="244" width="412" height="32" rx="10" style="fill: none; stroke: var(--vp-c-divider)" />
<g text-anchor="end" style="font-size: 11px; font-style: italic; fill: var(--vp-c-text-3)">
<text x="338" y="136">lost on unmount</text>
<text x="338" y="192">hand-built</text>
<text x="338" y="264">no rules</text>
</g>
<rect x="348" y="37.5" width="60" height="20" rx="10" style="fill: var(--vp-button-brand-bg); stroke: var(--vp-button-brand-bg)" />
<text x="378" y="51.5" text-anchor="middle" style="font-size: 11px; fill: var(--vp-button-brand-text)">submit</text>
<rect x="348" y="177.5" width="60" height="20" rx="10" stroke-dasharray="3 3" style="fill: none; stroke: var(--vp-c-text-3)" />
<text x="378" y="191.5" text-anchor="middle" style="font-size: 11px; fill: var(--vp-c-text-2)">save</text>
<line x1="0" y1="296" x2="420" y2="296" style="stroke: var(--vp-c-divider)" />
<text x="12" y="326" style="font-family: var(--vp-font-family-base); font-size: 14px; font-weight: 600; fill: currentColor">Parts-first · every part is a form</text>
<path d="M18 364 V466 M18 382 H34 M18 438 H34 M18 466 H34 M46 392 V410 H62 M46 476 V522 M46 494 H62 M46 522 H62" style="fill: none; stroke: var(--vp-c-border)" />
<g style="fill: currentColor">
<text x="12" y="358">event form</text>
<text x="40" y="386">details</text>
<text x="68" y="414">capacity</text>
<text x="40" y="442">payout</text>
<text x="40" y="470">tickets</text>
<text x="68" y="498">ticket 1</text>
<text x="68" y="526">ticket 2</text>
<text x="12" y="570"><tspan style="fill: var(--vp-c-text-3)">table cell · </tspan>capacity</text>
</g>
<rect x="4" y="550" width="412" height="32" rx="10" style="fill: none; stroke: var(--vp-c-divider)" />
<path d="M136 410 H186 Q196 410 196 420 V556 Q196 566 186 566 H182" stroke-dasharray="4 3" style="fill: none; stroke: var(--vp-c-brand-1)" />
<g text-anchor="end" style="font-size: 11px; font-style: italic; fill: var(--vp-c-text-3)">
<text x="338" y="442">off · kept, not sent</text>
</g>
<text x="204" y="488" style="font-size: 11px; font-style: italic; fill: var(--vp-c-brand-1)">same definition</text>
<g style="fill: var(--vp-button-brand-bg); stroke: var(--vp-button-brand-bg)">
<rect x="348" y="343.5" width="60" height="20" rx="10" />
<rect x="348" y="556" width="60" height="20" rx="10" />
</g>
<g text-anchor="middle" style="font-size: 11px; fill: var(--vp-button-brand-text)">
<text x="378" y="357.5">submit</text>
<text x="378" y="570">submit</text>
</g>
<g style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1)">
<rect x="348" y="371.5" width="60" height="20" rx="10" />
<rect x="348" y="399.5" width="60" height="20" rx="10" />
<rect x="348" y="427.5" width="60" height="20" rx="10" opacity="0.4" />
<rect x="348" y="455.5" width="60" height="20" rx="10" />
<rect x="348" y="483.5" width="60" height="20" rx="10" />
<rect x="348" y="511.5" width="60" height="20" rx="10" />
</g>
<g text-anchor="middle" style="font-size: 11px; fill: var(--vp-c-brand-1)">
<text x="378" y="385.5">submit</text>
<text x="378" y="413.5">submit</text>
<text x="378" y="441.5" opacity="0.4">submit</text>
<text x="378" y="469.5">submit</text>
<text x="378" y="497.5">submit</text>
<text x="378" y="525.5">submit</text>
</g>
</svg>
<figcaption style="margin-top: 1rem; font-size: 0.875rem; font-style: italic; text-align: center; color: var(--vp-c-text-3)">The same event form, two models. Root-first, only the root submits. Parts-first, a solid pill submits a whole form and a light one submits just its part, so the table cell is a form of its own with the capacity rule.</figcaption>
</figure>

In code, it's the same call at every level.

```ts
form.handleSubmit(publishEvent)
form.group('payout').handleSubmit(savePayout)
form.array('tickets').items[0].handleSubmit(saveTicket)
```

With that in place, the workarounds have nothing left to do. The ticket row is a part of the tree, so it submits like the whole form, and the hand-written validation from the TODO can go. Payout becomes a branch that the event type switches off. While it's off, it isn't validated or sent, and what the user typed is still there when they come back, so nothing needs a watcher.

Mounting and unmounting never touch the state either, so going back a step loses nothing. And because a definition can be the root of a form by itself, the capacity cell gets the same rule as the wizard without dragging the whole event along.

Types follow the same idea. A part takes its type from its own definition, not from a union of every path in the form, so the payout step knows payout and nothing else, and big or nested forms stay typed without making the compiler sweat.

The last thing I wanted was a library that doesn't guess. What happens on unmount? Does a server error survive the next validation? What does "empty" mean? formtree answers each of them with one written rule instead of an option or a best guess. I wrote those rules before any code, and they're in the docs as the [design rules](https://form-tree.netlify.app/guide/design-rules).

---

Trying it doesn't mean switching libraries. Any definition can be the root of its own form, and the Vue and React adapters need no app-wide setup, so formtree can start in a single component next to whatever you use today. Pick the form that keeps collecting workarounds, maybe one that's saved in parts or changes shape, or start with a single table cell. A login form won't change much, and that's fine, because the library you already have is great at those.

Version 0.1.0 is out, and since formtree is still young, this is a good time to shape it. The [docs](https://form-tree.netlify.app) have live examples you can play with right in the browser, and if something feels off or missing, I'd really like to hear about it on [GitHub](https://github.com/tinas/formtree).

As for that TODO, it's still there. Trying formtree on the form that started all of this is next on my list, and if that comment finally gets to go, I'll call it a win.

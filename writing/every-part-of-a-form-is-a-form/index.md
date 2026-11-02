---
title: Every Part of a Form Is a Form
description: Why I wrote formtree, starting with a browser rule I didn't know and two libraries that almost fit.
date: 2026-11-01
photo:
  by: Manuel Sardo
  href: https://unsplash.com/@manuelsardo
  image: ./cover.jpg
---

# Every Part of a Form Is a Form

<WritingMeta />

<WritingImage />

A lot of my work is forms. The app I work on has dozens of them, and most carry more logic than their fields suggest. Some rules have to ask the server, some depend on other answers, and some depend on things the form doesn't hold at all.

One of them has a composable that saves a single row of a list, and it opens with a TODO asking someone to revisit how complex the file is. The comment is fair. To save that one row, the file picks the row's fields out of the bigger form, validates them one by one and resets them by hand.

That TODO is where [formtree](https://form-tree.netlify.app) started. The real forms need too much context to explain, so I'll tell the story through an event form instead. Every problem below happened in the real ones.

---

Creating an event takes two steps, details first and then tickets, and each step has to be valid before the next one opens. Once the event exists, each ticket type is edited and saved on its own, and that's the row from the TODO.

The rules are where it gets interesting. An event's name has to be unique among the organizer's events, and only the server knows whether it is. The address only matters for events in a venue. And a free plan can only sell so many tickets, a limit the form itself never holds.

We use vee-validate with Zod, and for a screen with a single submit, it's great. The trouble starts with the steps.

Each step needs its own check before Next, and the obvious idea is to make every step a form of its own inside the wizard's form. I'd tried exactly that years ago and found out that HTML doesn't allow it. A `<form>` can't contain another `<form>`, and a browser reading one inside another simply drops the inner tag.

So the wizard does what most wizards do. Each step has its own form, and only the current one is on screen. Its values have to survive when it leaves, so the forms keep them after unmounting, and every step copies its values into a shared object at the top of the wizard, where the last step sends them all.

The Next button lives in a footer outside the step, so it emits an event and the step listens for it. There's a simpler way I'd also known about for years. A button doesn't have to be inside a form to submit it. Give the form an `id`, put `form="that-id"` on the button, and the browser connects the two. I'll come back to it.

Neither lesson was new to me, but it took years to see that they point at the same thing. The browser treats a form as one root with one submit, and form libraries follow the browser. Fields register into the root, rules attach to the root, and a submit validates all of it. That's the right model for most forms, and it was the wrong one for this one.

---

Forms come in many shapes, and each one is shaped by what its case needs. On the event form, a ticket type wants to be saved alone, but only the root can submit, so its validation is put together by hand, which is exactly what the TODO complains about.

The address is declared optional, and a check on the whole step adds its errors back when the event isn't online. Zod runs that check only once the rest of the step is valid, so the address errors show up last, after everything else is fixed.

The ticket limit doesn't live in the form at all. The rule reads it from wherever the app keeps the plan, and the library never sees that, so when the organizer upgrades halfway through, nothing checks the tickets again.

Then there's the name. Whether it's taken lives on the server, and a schema can't wait for a request, so the check is split in two. The input waits for the typing to pause, asks the server, and a watcher writes "this name is taken" into the field. The schema peeks into the request cache for the same name, only so that the next validation doesn't wipe that error.

It works, mostly. Click Next before the answer arrives and the step moves on with a name nobody checked. And the two halves have to agree on exactly which name they mean, down to a trailing space, or the error quietly disappears.

None of this is a big deal alone. Together it's the same workaround in different clothes. Each one is a piece of the form that wants to own something, its submit or its rules, in a library where only the root owns anything.

---

Being annoyed isn't a reason to write a library, least of all in a space this crowded, so I looked hard at the alternatives first.

[TanStack Form](https://tanstack.com/form) came closest. It can submit a group of fields on its own and debounces its async checks. But a field's rules are written on the field component in the template, and each input is wired to its handlers by hand. I wanted the rules to live with the form and the template to only bind.

[Formwerk](https://formwerk.dev) gets the binding exactly right. A composable hands you the props for your input, label and error message, and you spread them onto your elements, with accessibility handled for you. It comes from the author of vee-validate, and its [forms guide](https://formwerk.dev/guides/forms/) feels familiar, with `useForm`, `handleSubmit` and a form-level schema. My guess, and it's only mine, is that this is where vee-validate is heading.

But Formwerk's groups, as its docs put it, are not nested forms and don't submit on their own. So one library had parts that submit, the other had binding that felt right, and neither had both.

---

My first attempt kept what we already had, one schema for the whole form, and added windows on top, so `form.group('details')` gave you a step that could validate and submit by itself.

It held up until the values. A schema only runs as a whole, so validating a step meant running the entire form's schema and keeping the step's errors. Errors survived the trip, values didn't. The name field trims its spaces, yet the step still handed over `" Summer meetup "`, because only the full schema produces the cleaned value.

The rest broke the same way. The name check sat on the root by its path, so a step couldn't take its rules along, and every window's type was worked out from every path in the form. The parts were borrowing everything from the root, so they couldn't own anything.

So I deleted it and started over, this time from the parts.

---

The shape came from an unexpected place. In [TanStack Router](https://tanstack.com/router), each route is defined on its own with its own schema, and the routes are put together into a tree. A route tree isn't a form, of course. Routes can nest because nothing stops them, and forms can't because HTML does, so the comparison only goes so far.

It did point at something, though. The nesting rule belongs to the DOM, and a form's state doesn't have to live there. If the tree lives in JavaScript, the DOM still decides which elements are on screen, but it no longer decides which parts of the form can submit.

In formtree, a form is a tree of definitions. A definition describes one part, like a step, a ticket type or a single field, with its schema, its rules and its children. It holds no state, so it can be used anywhere. The form turns the tree into one state, and every part of it validates and submits the way the whole form does.

<figure style="margin: 2.5rem 0">
<svg viewBox="0 0 420 404" role="img" aria-label="Two views of the same event form. In the DOM, a form inside another form is not allowed, but a footer button can submit the current step's form through its form attribute. In the tree, the event form has a details step with an address inside it and a tickets step with two ticket types. Every node has its own submit. The root's submit covers the whole tree and the tickets step's submit covers only its ticket types. The details step is the form element on screen, the address is off for online events, and the first ticket type is the row from the TODO." style="display: block; width: 100%; max-width: 28rem; height: auto; margin: 0 auto; font-family: var(--vp-font-family-mono); font-size: 13px">
<text x="12" y="20" style="font-family: var(--vp-font-family-base); font-size: 14px; font-weight: 600; fill: currentColor">In the DOM · one form, no nesting</text>
<g style="font-size: 11px; font-style: italic; fill: var(--vp-c-text-3)">
<text x="12" y="46">not allowed</text>
<text x="220" y="46">what works</text>
</g>
<rect x="8" y="58" width="196" height="104" rx="8" style="fill: none; stroke: var(--vp-c-border)" />
<text x="20" y="80" style="fill: currentColor">&lt;form&gt; wizard</text>
<rect x="22" y="94" width="168" height="52" rx="6" stroke-dasharray="4 3" style="fill: none; stroke: var(--vp-c-text-3)" />
<text x="34" y="125" style="fill: var(--vp-c-text-3)">&lt;form&gt; step</text>
<rect x="216" y="58" width="196" height="48" rx="8" style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1)" />
<text x="228" y="87" style="font-size: 12px; fill: currentColor">&lt;form id="details"&gt;</text>
<rect x="216" y="130" width="196" height="32" rx="8" style="fill: none; stroke: var(--vp-c-border)" />
<text x="228" y="150" style="font-size: 12px; fill: currentColor">&lt;button form="details"&gt;</text>
<path d="M314 130 V112" style="fill: none; stroke: var(--vp-c-brand-1)" />
<path d="M310 114 L314 107 L318 114 Z" style="fill: var(--vp-c-brand-1)" />
<text x="324" y="123" style="font-size: 11px; font-style: italic; fill: var(--vp-c-brand-1)">submits</text>
<line x1="0" y1="184" x2="420" y2="184" style="stroke: var(--vp-c-divider)" />
<text x="12" y="212" style="font-family: var(--vp-font-family-base); font-size: 14px; font-weight: 600; fill: currentColor">In the tree · every part submits</text>
<rect x="28" y="311" width="388" height="86" rx="8" stroke-dasharray="4 3" style="fill: none; stroke: var(--vp-c-brand-1)" />
<path d="M18 252 V326 M18 270 H34 M18 326 H34 M46 280 V298 H62 M46 336 V382 M46 354 H62 M46 382 H62" style="fill: none; stroke: var(--vp-c-border)" />
<g style="fill: currentColor">
<text x="12" y="246">event form</text>
<text x="40" y="274">details</text>
<text x="68" y="302">address</text>
<text x="40" y="330">tickets</text>
<text x="68" y="358">ticket 1</text>
<text x="68" y="386">ticket 2</text>
</g>
<g style="font-size: 11px; font-style: italic; fill: var(--vp-c-text-3)">
<text x="110" y="246">submits the whole tree</text>
<text x="112" y="274">the step's &lt;form&gt; on screen</text>
<text x="140" y="302">off for online events</text>
<text x="118" y="330">submits only its branch</text>
<text x="150" y="358">the row from the TODO</text>
</g>
<rect x="348" y="231.5" width="60" height="20" rx="10" style="fill: var(--vp-button-brand-bg); stroke: var(--vp-button-brand-bg)" />
<text x="378" y="245.5" text-anchor="middle" style="font-size: 11px; fill: var(--vp-button-brand-text)">submit</text>
<g style="fill: var(--vp-c-brand-soft); stroke: var(--vp-c-brand-1)">
<rect x="348" y="259.5" width="60" height="20" rx="10" />
<rect x="348" y="287.5" width="60" height="20" rx="10" opacity="0.4" />
<rect x="348" y="315.5" width="60" height="20" rx="10" />
<rect x="348" y="343.5" width="60" height="20" rx="10" />
<rect x="348" y="371.5" width="60" height="20" rx="10" />
</g>
<g text-anchor="middle" style="font-size: 11px; fill: var(--vp-c-brand-1)">
<text x="378" y="273.5">submit</text>
<text x="378" y="301.5" opacity="0.4">submit</text>
<text x="378" y="329.5">submit</text>
<text x="378" y="357.5">submit</text>
<text x="378" y="385.5">submit</text>
</g>
</svg>
<figcaption style="margin-top: 1rem; font-size: 0.875rem; font-style: italic; text-align: center; color: var(--vp-c-text-3)">Each submit covers its own branch, like tickets here, and the root's covers the whole tree. The address is off for an online event, and on screen only the current step needs a form element.</figcaption>
</figure>

Back in the wizard, each step is now a definition with its own rules, and the wizard is just the parent of the steps. Only the current step is on screen, as a regular `<form>` with the step's id, and the footer button submits it with the `form` attribute from earlier, with no event in between.

Each submit covers only its own branch, so Next checks the current step and never complains about one the user hasn't reached. Every step writes into the same state, though, so by the end the root holds everything, and its submit checks the whole tree. The root is that shared object at the top of the wizard, except nothing has to be copied into it.

Mounting and unmounting don't touch the state either, so a step that leaves the screen keeps its values without being told to.

A ticket type sits inside the tickets form on screen, so it can't be a form itself, and it doesn't need to be. Its save button calls the ticket's submit, because submitting a part is a method call on the tree. The hand-built validation from the TODO can go.

The address sits in a branch that the event's format switches on. While the event is online, the address isn't checked or sent, and what the user typed is still there if they switch back. Its rules belong to the branch, so their errors show up with the rest of the step.

The ticket limit becomes something the tickets ask for. Their definition says they need one, and the form hands it down from the plan. When the organizer upgrades, the rule is rebuilt and the tickets are checked again right away, without a watcher.

The name check moves into the name's definition. It runs once the schema has passed, so it sees the cleaned name. It's debounced and cancelled when the name changes, no other validation can wipe its error, and a submit that includes the name waits for the answer.

In code, it's the same call at every level.

```ts
form.handleSubmit(publishEvent)
form.group('details').handleSubmit(goToNextStep)
form.array('tickets').items[0].handleSubmit(saveTicket)
```

---

The binding is where Formwerk's idea comes back. The rules stay in the definitions, so the template has nothing to decide. An input asks for its field by name and gets back a model and the attributes it needs, like its id, name and aria state.

```vue
<input v-model="field.model" v-bind="field.attrs" />
```

That's the whole wiring. Labels, error messages and focusing the first error go through those ids, so the components stay yours and the form never renders anything.

---

Trying it doesn't mean switching libraries. Any definition can be the root of its own form, and the Vue and React adapters need no app-wide setup, so formtree can start in one component next to whatever you use today. Pick the form that keeps collecting workarounds, like a wizard or a list saved row by row. A login form won't change much, and that's fine, because your current library is great at those.

Version 0.1.0 is out, and since formtree is still young, this is a good time to shape it. The [docs](https://form-tree.netlify.app) have live examples, and if something feels off or missing, I'd love to hear about it on [GitHub](https://github.com/tinas/formtree).

As for that TODO, it's still there. Trying formtree on the form that started all of this is next on my list, and if that comment finally gets to go, I'll call it a win.

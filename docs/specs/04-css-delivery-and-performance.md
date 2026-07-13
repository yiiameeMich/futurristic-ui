# 04 — CSS Delivery & Performance

| | |
|---|---|
| Status | Binding |
| Last-verified | `dfcb150` |

Owns: how styles reach the browser and what they're allowed to cost. What mode CSS *contains* is [01](01-style-modes-and-theming.md)'s job. This doc protects the module's headline optimization: **an app pays only for the mode it runs.**

## 1. Delivery model (protected invariants)

Implementation: [src/runtime/plugins/futurristic-init.ts](../../src/runtime/plugins/futurristic-init.ts).

- Every mode's `index.css` is imported with a **static `?url` import** into a `Record<FuMode, string>` map (I12). Statically analyzable imports are what make Vite emit each mode as a separate hashed asset at build time; a dynamic template string would silently break emission. The `Record<FuMode, …>` type doubles as a compile-time completeness check when modes are added.
- One reactive `useHead()` renders exactly **one** `<link key="fu-mode-stylesheet" rel="stylesheet">` pointing at the active mode, together with the `data-fu-mode` attribute. The stable `key` makes a mode switch an href swap, not a link pile-up (I11).
- Mode CSS is **never** pushed to `nuxt.options.css` (I13). The only global stylesheet is `assets/shared/radius-utilities.css`. Component styles ship inside components (scoped).

Net effect: all modes are *emitted* (cheap, build output), only the active one is *fetched* (what users pay). Anti-goals — none of these may be introduced:

- ✗ Bundling all modes into one stylesheet
- ✗ Runtime style injection / constructed stylesheets for tokens
- ✗ CSS-in-JS
- ✗ Inlining mode CSS into HTML payloads

## 2. SSR behavior

The plugin runs on the server too: the initial HTML carries the correct `data-fu-mode` and mode `<link>` for the configured mode → tokens resolve on first paint, **zero FOUC** for the config-default case. The `useState('futurristic-mode')` value hydrates so client and server agree. (`setMode`'s direct `document.documentElement.dataset` write is client-only; SSR correctness comes from `useHead` — see [05 §2](05-module-config-and-dx.md).)

## 3. Mode switching

`setMode()` swaps the link href and attribute reactively. First switch to a not-yet-fetched mode has a window where the new mode's tokens are undefined (unstyled-token flash) until the stylesheet arrives; subsequent switches hit HTTP cache.

**Ratified design** (implementation tracked in [06 §Next](06-roadmap.md)): opt-in module option `prefetchModes: boolean` (default `false`). When `true`, the plugin also renders `<link rel="prefetch" as="style">` for every **inactive** mode. Default-off preserves the pay-for-what-you-run invariant; apps that expose a runtime switcher opt in and trade ~12KB×(N−1) of idle-time prefetch for flash-free switching. Prefetch (not preload) — inactive modes are a *possible future*, not a render-blocking need.

Until then, the flash is accepted, documented behavior: real apps set a mode per project and rarely switch.

## 4. Component & icon delivery

- Components are registered with `global: true` — every component is included in each consumer's entry bundle regardless of use. Acceptable at the current size (4 components); **revisit threshold: ~10 components or the first heavyweight one (Modal, complex Input)** — options then: `global: false` (lazy `Lazy*` variants / per-use resolution) or splitting heavy components. Recorded here so growth doesn't silently outrun the decision.
- Icons: per-icon lazy chunks, never eager (I9, detail in [03 §6](03-icon-pipeline.md)).

## 5. Budgets

Baseline at `dfcb150`: defend 11,489 B / guard 11,749 B / expert 11,748 B raw; shared utilities 1,256 B.

| Budget | Ceiling |
|---|---|
| Mode CSS, raw total per mode | **≤ 24 KB** (~5 KB gzipped) |
| New component's mode CSS, per mode | **≤ ~1.5 KB** |
| Shared global CSS | **≤ 2 KB** |
| Stylesheet requests for the active mode | **exactly 1** |
| Inactive-mode CSS fetched (prefetch off) | **0 bytes** |
| Icon delivery | individual lazy chunks only |

Verification today is manual (§6); a CI budget check is a roadmap tooling item ([06 §Tooling](06-roadmap.md)). Raising a ceiling is a spec amendment, not a drive-by.

## 6. PR regression checklist

For any change touching the plugin, mode assets, or module CSS wiring:

1. `ls` the built client assets — one CSS file per mode, hashed, plus the shared/entry CSS. No mode CSS concatenated into the entry stylesheet.
2. View source of the served page — exactly one `fu-mode-stylesheet` link; `data-fu-mode` matches the configured mode.
3. Network tab on first load — no request for any inactive mode's CSS.
4. Trigger `setMode()` in the playground — link href swaps, old mode's styles stop applying, no duplicate links accumulate.
5. `wc -c src/runtime/assets/modes/<mode>/*.css` — within budget (§5).

## Known deviations

None. This doc's invariants currently hold in code.

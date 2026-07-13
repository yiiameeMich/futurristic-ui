# 05 — Module Config & DX

| | |
|---|---|
| Status | Binding |
| Last-verified | `dfcb150` |

Owns: the consumer-facing surface — module options, composable API, packaging, versioning. Consumers of the npm package: this is your entry point.

## 1. Module options

Config key: `futurristic`. Compatibility: `nuxt ^3.0.0 || ^4.0.0`.

| Option | Type | Default | Effect |
|---|---|---|---|
| `mode` | `FuMode` | `"defend"` | Initial style mode for the app. Written to `runtimeConfig.public.futurristic.mode` (via `defu`, so an explicit runtimeConfig value wins). Because it's public runtimeConfig, **`NUXT_PUBLIC_FUTURRISTIC_MODE`** overrides it per environment without a rebuild. |
| `prefix` | `string` | `"Fu"` | Component **name** prefix only (`<FuButton>` → `<AppButton>` with `prefix: "App"`). Never changes `fu-` classes or `--fu-` tokens (I14). |

Planned (design ratified in [04 §3](04-css-delivery-and-performance.md), not yet implemented): `prefetchModes?: boolean` (default `false`).

Policy for future options: merge via `defu` into the existing shapes; an option **MUST NOT** violate the delivery invariants (I11–I13) — e.g. no "bundle all modes" convenience flag.

```ts
// nuxt.config.ts (consumer)
export default defineNuxtConfig({
  modules: ["@yiiameemich/futurristic-ui"],
  futurristic: { mode: "guard" },
});
```

## 2. Composable contract — `useFuturristic()`

Auto-imported. Returns:

| Member | Contract |
|---|---|
| `mode` | `Readonly<Ref<FuMode>>` — the active mode. Initialized from runtimeConfig (fallback `"defend"`), shared app-wide via `useState('futurristic-mode')`. |
| `setMode(mode: FuMode)` | Switches mode app-wide: updates the state (which drives the plugin's `useHead` → attribute + stylesheet swap) **and**, on the client, writes `document.documentElement.dataset.fuMode` directly for an immediate flip ahead of head patching. The direct write is a client-only fast path; SSR correctness comes from `useHead` ([04 §2](04-css-delivery-and-performance.md)). |
| `setConfig(config: Partial<FuConfig>)` | Config-object form; today delegates `mode` to `setMode`. Grows with `FuConfig`. |

State key `"futurristic-mode"` is reserved; nothing else may write it.

## 3. Consumer setup guide (canonical outline)

The root `README.md` rewrite (**D7**) follows this outline:

1. **Install** — `npm i @yiiameemich/futurristic-ui`; icon types generate automatically on postinstall.
2. **Register** — add to `modules`, set `futurristic: { mode }`.
3. **Use components** — `<FuButton>`, `<FuLink>`, `<FuBadge>`, `<FuIcon icon-name="…">` are globally available; props typed, icon names autocomplete from the generated registry.
4. **Switch modes** — `const { mode, setMode } = useFuturristic()`.
5. **Import types** — `import type { ILinkProps, FuMode } from "@yiiameemich/futurristic-ui"`.
6. **Tailwind (optional)** — §4.
7. **Tokens** — consumers may read documented `--fu-*` tokens in their own CSS; defining/overriding `--fu-*` values is unsupported.

## 4. Tailwind preset (optional consumer opt-in)

`tailwind-preset.cjs`, exported as `./tailwind-preset`:

```js
// tailwind.config.js (consumer)
module.exports = { presets: [require("@yiiameemich/futurristic-ui/tailwind-preset")] };
```

Maps utilities to **semantic tokens only**: the 13 color aliases as `fu-*` colors (`bg-fu-surface`, `text-fu-primary`, …) and `rounded-fu` / `rounded-fu-lg` from the generic radius aliases. Primitives and component tokens are deliberately not exposed — consumer code should track mode semantics, not mode internals. Adding a semantic alias ([01 §2.2](01-style-modes-and-theming.md)) requires updating the preset in the same PR.

## 5. Packaging contract

| Field | Value / rule |
|---|---|
| `exports` | `.` → module (+ types); `./runtime/types/icon` → icon type entry; `./tailwind-preset` → preset. New public entry points get an `exports` entry + `typesVersions` mapping — consumers never deep-import `dist` paths that aren't declared. |
| `files` | `dist`, `scripts`, `tailwind-preset.cjs`. **`scripts` ships on purpose**: consumer `postinstall` runs `scripts/generate-fu-icon-types.mjs`, which uses its dist-fallback to scan `dist/runtime/assets/icons` and write types into `dist` ([03 §3](03-icon-pipeline.md)). Removing `scripts` from `files` breaks icon typing in consumers. |
| Lifecycle | `postinstall` → icon typegen; `prepack` → typegen + `nuxt-module-build build`; `dev:prepare` → typegen + stub build + playground prepare. |
| Deps | Runtime deps: `@nuxt/kit`, `defu`, `vite-svg-loader`. Peer: `nuxt ^3 || ^4`. Components' `vue`/`vue-router` imports resolve through the consumer's Nuxt. |
| Release | `npm run release` = lint + test + prepack + changelogen + publish + push tags. |

## 6. API surface & versioning policy

The **public API** is:

1. Module options (§1)
2. Component names, props, slots, and emitted DOM structure
3. Exported types (from the module entry and declared subpath exports)
4. `useFuturristic()` (§2)
5. Documented `--fu-*` tokens ([01 §2](01-style-modes-and-theming.md)) and `fu-` classes (incl. `.fu-radius-*` utilities)
6. The Tailwind preset's utility names

**Breaking** (semver major once ≥1.0; pre-1.0 = minor bump + explicit changelog "BREAKING" entry): removing/renaming any of the above, changing a token's meaning, changing a component's DOM structure (consumers style against it), changing a default (`mode`, `prefix`), dropping a Nuxt major. Internal consumers get no informal exceptions — the changelog is the contract.

**Non-breaking**: adding tokens/components/options/modes, changing token *values* within a mode (that's design iteration), adding icons.

## 7. Known deviations

| ID | Deviation | Resolution |
|---|---|---|
| D7 | Root `README.md` is the unmodified starter template ("My Module", Foo/Bar/Baz) | Rewrite per §3 outline — [06 §Now](06-roadmap.md) |

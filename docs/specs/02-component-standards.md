# 02 — Component Standards

| | |
|---|---|
| Status | Binding |
| Last-verified | `dfcb150` |

Owns: how components are authored. Reference implementation for the patterns below: [src/runtime/components/Button.vue](../../src/runtime/components/Button.vue).

Components live in `src/runtime/components/`, one file per component, auto-registered globally with the configurable name prefix (default `Fu` → `<FuButton>`).

## 1. Authoring checklist — definition of done (binding)

Every component **MUST**:

- [ ] Use `<script setup lang="ts">`.
- [ ] Export its props type: `export interface I<Name>Props` (or exported type alias for discriminated unions, cf. `ILinkProps`), declared with `defineProps<…>()` + `withDefaults` for all optional props.
- [ ] Declare `defineOptions({ inheritAttrs: false })` and spread `v-bind="$attrs"` on the root element (I8) — consumers can attach classes, ids, data attributes, listeners.
- [ ] Use `<style scoped>` only.
- [ ] Follow the class grammar: block `fu-<name>`, modifiers `fu-<name>--<modifier>` (incl. variant classes like `fu-button--theme-primary`), elements `fu-<name>__<element>`. The `fu-` class prefix is fixed (I14).
- [ ] Style exclusively via `--fu-*` tokens or its own hook vars — **no hardcoded colors, radii, or shadows** (I7). Structural values (padding, gap, height, font-size) are allowed as literals.
- [ ] Take its radius from the matching radius slot — via the `.fu-radius-<slot>` utility class or `border-radius: var(--fu-radius-<slot>)`.
- [ ] Style `:focus-visible` (visible outline offset from the element; see `Link.vue` for the pattern). Deviation: **D5** — Button has none.
- [ ] Express disabled as the pair: native `:disabled` attribute (where the element supports it) **and** a `fu-<name>--disabled` class, with selectors covering both (`.fu-x--disabled, .fu-x:disabled`).
- [ ] Drive hover/active via native pseudo-classes guarded against disabled (`:hover:not(:disabled)`), reading state tokens with fallback chains: `var(--x-hover, var(--x, none))` — so a variant that doesn't define a state inherits the base value instead of breaking.
- [ ] Never reference a mode name (no `data-fu-mode` selectors) — per-mode differences are token-side ([01 §6](01-style-modes-and-theming.md)); the escape hatch requires registration there.
- [ ] Set sensible a11y attributes for its role (`aria-current`, `focusable="false"` on decorative SVGs, etc.).

## 2. Sizing

Size variants (`sm`/`md`/`lg`/`xl` where applicable) use fixed heights and paddings per variant class (Button: 36/44/48/56px). Structural sizing is a component concern, not a token concern — modes change look, not layout.

## 3. The variant-to-hook two-tier pattern

The kit's core styling pattern. Base rules consume only variant-less **hook vars**; variant classes map **mode tokens** onto those hooks. This keeps base rules single-sourced and makes variants pure token-wiring:

```css
/* tier 1: base rule — hooks only */
.fu-button {
  background-color: var(--fu-button-bg);
  border: 1px solid var(--fu-button-border-color);
  color: var(--fu-button-text);
}
.fu-button:hover:not(:disabled) {
  background-color: var(--fu-button-bg-hover);
}

/* tier 2: variant class — wires mode tokens into hooks */
.fu-button--theme-primary.fu-button--type-main {
  --fu-button-bg: var(--fu-btn-primary-main-bg);
  --fu-button-border-color: var(--fu-btn-primary-main-border);
  --fu-button-text: var(--fu-btn-primary-main-text);
  --fu-button-bg-hover: var(--fu-btn-primary-main-bg-hover);
  /* … */
}
```

Rules: hook vars are variant-less and defined only in the component file ([01 §2.5](01-style-modes-and-theming.md)); every `theme × type` combination gets a wiring block; optional per-variant props (e.g. `shadow` only on `subtle-lift`) read through fallbacks in tier 1 (`var(--fu-button-shadow, none)`).

## 4. Props vocabulary

Consistent axes across the kit — reuse these names before inventing new ones:

| Prop | Meaning | Existing values |
|---|---|---|
| `theme` | Color/intent family | Button: `primary\|secondary`; Link: `primary\|secondary\|tertiary`; Badge: `success\|misc\|danger\|warning\|neutral` |
| `type` | Visual treatment within a theme | Button: `main\|subtle\|subtle-border\|subtle-lift` |
| `size` | Physical size | `sm\|md\|lg\|xl` |
| `disabled`, `selected`, `iconOnly`, `external` | Boolean flags, default `false` | |
| `prependIcon` / `appendIcon` | `Component` (render any icon component, typically `FuIcon` or a raw SVG import) | paired with `prependIconClass` / `appendIconClass: string` |
| `prependIconName` / `appendIconName` | `FuAnyIconName` — project icon addressed by name, rendered through `FuIcon` | paired with `prependIconType` / `appendIconType: FuIconType` (default `general`) |
| `prependIconColor` / `appendIconColor` | Any CSS color, applied inline to the icon | omitted ⇒ icon inherits host text color (all shipped SVGs use `currentColor`) |

- Icon sizing is a **floor, not a box**: hosts set `--fu-icon-size` from their own size (`FuButton` sm/md → 20px, lg/xl → 24px; `FuLink` → 20px) and icons apply it as `min-width` / `min-height` only, so the rendered width/height still come from the SVG markup. `FuIcon` falls back to `20px` when no host sets the var.
- Icon slots are one shared shape, `IIconSlotProps` in [src/runtime/types/icon-slot.ts](../../src/runtime/types/icon-slot.ts), consumed by `FuButton` and `FuLink`. A component passed to `prependIcon` **wins over** `prependIconName`; names are not unique across icon sets, so `*IconType` selects the set and that pairing is not compile-checked. Resolution lives in [src/runtime/utils/icon-slot.ts](../../src/runtime/utils/icon-slot.ts).

- Mutually exclusive prop shapes use **discriminated unions** — reference: `ILinkProps = ILinkPropsInternal | ILinkPropsExternal` discriminated on `external`, in [src/runtime/types/link.ts](../../src/runtime/types/link.ts).
- Generics for route typing follow Link: `generic="TInternal extends RouteLocationRaw"` so consumers with typed routes get narrowed `destination`.
- Content goes through slots (default slot for label/children), not string props.

## 5. Type export contract

Every public type (props interfaces, unions, helper types) **MUST** be re-exported from the module entry [src/module.ts](../../src/module.ts), so consumers import from `@yiiameemich/futurristic-ui` — never from `dist` internals. Current pattern: `export type { ILinkProps, … } from "./runtime/types/link"`. Component-file-local exports (e.g. `IButtonProps`, `IBadgeProps` declared in SFCs) must also be surfaced this way when they become part of the documented API.

## 6. Testing & playground bar

For every component (the bar for new work; backfill tracked in [06 §Tooling](06-roadmap.md)):

- **Playground**: a section demonstrating all variant combinations, visible on **each** mode page — today via `playground/components/ButtonStateMatrix.vue`, which fakes hover/active with `.preview-state--*` classes re-applying the state hooks so all states render side by side.
- **Tests**: minimal render test (mounts, emits/handles its interactions); `npm run test` and `npm run test:types` (vue-tsc over module + playground) stay green.

## 7. Adding a new component — checklist

1. Define its component tokens in **every** mode's category file (create `modes/*/<family>.css` + add the `@import` to each `index.css`) — parity rule [01 §5](01-style-modes-and-theming.md).
2. If it has a new shape: add the radius slot to every mode's `radiuses.css` + the utility class in `shared/radius-utilities.css` ([01 §2.3](01-style-modes-and-theming.md)).
3. Author `src/runtime/components/<Name>.vue` per §1, using the two-tier pattern (§3) and props vocabulary (§4).
4. Export public types from `src/module.ts` (§5).
5. Add playground coverage on all mode pages + tests (§6).
6. Check the CSS budget impact ([04 §5](04-css-delivery-and-performance.md)): ≤ ~1.5KB of mode CSS per mode.
7. Update this doc's component inventory (§8) and [06-roadmap.md](06-roadmap.md).

No changes to `module.ts` registration or the plugin are needed — `addComponentsDir` picks the file up automatically.

## 8. Component inventory

| Component | Props axes | Notes |
|---|---|---|
| `FuButton` | `theme` ×2, `type` ×4, `size` ×4, `iconOnly`, `disabled`, prepend/append icons | Reference implementation |
| `FuLink` | `theme` ×3, `selected` (tertiary), `external`/`destination` union, `disabled`, icons | Internal nav validates via `router.resolve` before `navigateTo`; **D4** below |
| `FuBadge` | `theme` ×5 | **D1** — per-mode `:global` overrides |
| `FuIcon` | `iconName`/`iconType` (generated union) | Delivery contract in [03](03-icon-pipeline.md) |

## 9. Known deviations

| ID | Deviation | Resolution |
|---|---|---|
| D4 | `Link.vue` renders `<button role="link">` — no real `href`, so no cmd/middle-click, no context menu, no crawler visibility, weaker AT affordances | **Decided**: migrate to `<a>`/`NuxtLink` rendering with the existing props API preserved; DOM-structure change ships per versioning policy [05 §6](05-module-config-and-dx.md) — [06 §Next](06-roadmap.md) |
| D5 | `Button.vue` lacks `:focus-visible` styling (§1) | Add outline per Link's pattern — [06 §Now](06-roadmap.md) |
| D1 | `Badge.vue` mode-name selectors (§1, [01 §6](01-style-modes-and-theming.md)) | Token-side migration — [06 §Now](06-roadmap.md) |

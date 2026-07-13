# 01 — Style Modes & Theming

| | |
|---|---|
| Status | Binding |
| Last-verified | `dfcb150` |

Owns: what modes are, the token grammar, and what mode CSS files may contain. How that CSS reaches the browser is [04](04-css-delivery-and-performance.md)'s job.

## 1. Mode model

- `FuMode = "defend" | "guard" | "expert"` — defined once in [src/runtime/types.ts](../../src/runtime/types.ts). Planned: `validate` ([06 §Next](06-roadmap.md)).
- Modes are **brand themes** (different palettes, radii, component looks), not color schemes. All current modes are light-surface themes.
- Exactly **one** mode is active per document, expressed as `<html data-fu-mode="<mode>">` (I1). All theming derives from that attribute.
- Selection: consuming app sets a default in `nuxt.config` (`futurristic.mode`); `setMode()` may switch at runtime ([05 §2](05-module-config-and-dx.md)).
- Character of the current modes (for orientation, not a rule): `defend` = pill radii, blue brand + purple accent; `guard` = squared radii, bright blue brand + fuchsia/blue accents; `expert` = squared radii, stone brand + amber/indigo accents.

## 2. Token grammar (binding)

All tokens are CSS custom properties prefixed `--fu-`. Four layers; a token's layer determines where it may be defined and what its value may be.

### 2.1 Primitives — `--fu-color-<family>-<step>`

Raw color values. **The only layer allowed to contain raw hex/rgb values (I5).**

| Family | Steps | Notes |
|---|---|---|
| `base` | `white`, `black`, `transparent` | Named, not numeric |
| `gray`, `brand`, `error`, `warning`, `success`, `accent-alpha`, `accent-beta` | `25 50 100 200 300 400 500 600 700 800 900 950` | 12-step ramps; values differ per mode |

New families require updating this table. `accent-beta` is required in every mode (parity, §5) — currently missing in `defend` (**D3**).

### 2.2 Semantic roles — 13 aliases

Defined at the bottom of each mode's `colors.css`, always as `var()` references to primitives:

`--fu-primary`, `--fu-primary-light`, `--fu-primary-dark`, `--fu-secondary`, `--fu-accent`, `--fu-surface`, `--fu-surface-raised`, `--fu-on-surface`, `--fu-on-primary`, `--fu-border`, `--fu-success`, `--fu-warning`, `--fu-danger`.

This set is mirrored 1:1 by the Tailwind preset ([05 §4](05-module-config-and-dx.md)) — adding a semantic role means updating `tailwind-preset.cjs` too. Modes may point the same alias at different families (e.g. `--fu-accent` → `accent-alpha-500` in defend/guard, `accent-beta-500` in expert). That is the intended use of the layer.

### 2.3 Radius slots — `--fu-radius-<slot>`

One slot per component shape, defined in each mode's `radiuses.css`. Current 19 slots:

`button`, `button-icon-only`, `input`, `tab`, `card-sm`, `card-md`, `card-sidebar`, `text-form`, `result-panel`, `modal`, `upload-base`, `menu`, `badge`, `tag`, `nav-item`, `icon-container`, `avatar`, `tooltip`, `featured-icon`

Plus two generic aliases: `--fu-radius` (= button) and `--fu-radius-lg` (= card-md), consumed by the Tailwind preset. Each slot has a matching `.fu-radius-<slot>` utility class in `assets/shared/radius-utilities.css` (§9). Adding a slot = add it to **every** mode's `radiuses.css` + the utility file.

### 2.4 Component tokens — `--fu-<comp>-<variant…>-<prop>[-<state>]`

Per-component values, defined **only in mode files**, consumed by components. Grammar is positional with closed vocabularies:

| Segment | Vocabulary |
|---|---|
| `<comp>` | Component short name (`btn`, `link`, …) |
| `<variant…>` | One or more variant segments, e.g. `primary-main`, `secondary-subtle-border`, `tertiary` |
| `<prop>` | `bg` \| `border` \| `text` \| `fg` \| `shadow` |
| `<state>` | *(absent = base)* \| `hover` \| `active` \| `disabled` \| `selected` |

Examples from the current set: `--fu-btn-primary-main-bg-hover`, `--fu-btn-secondary-subtle-border-border-disabled` (variant `subtle-border` + prop `border` — the closed vocabularies make this parseable), `--fu-link-tertiary-bg-selected`.

**The disambiguator between component tokens and hook vars is variant presence**: component tokens always carry a variant; hook vars never do.

### 2.5 Hook vars — `--fu-<comp>-<prop>[-<state>]`, variant-less

Defined **only inside a component's own `<style>` block**, never in mode files. They are the internal indirection a component's variant classes write mode tokens into (the two-tier pattern, [02 §3](02-component-standards.md)). Examples: `--fu-button-bg`, `--fu-button-border-color`, `--fu-link-fg`, `--fu-badge-text`. Being component-internal, their `<prop>` segment may be descriptive beyond the §2.4 vocabulary (e.g. `border-color`); the §2.4 prop enum binds mode-file tokens only.

Naming note: the existing `--fu-btn-*` (mode tokens) vs `--fu-button-*` (hooks) spelling split is **frozen legacy**, not a pattern. For new components, use the same `<comp>` spelling in both layers; variant presence alone distinguishes them.

## 3. Mode CSS file contract

Layout per mode — `src/runtime/assets/modes/<mode>/`:

| File | Content |
|---|---|
| `index.css` | `@import` lines only, one per category file. Nothing else. |
| `colors.css` | Primitives + the 13 semantic aliases |
| `radiuses.css` | All radius slots + the 2 generic aliases |
| `buttons.css`, `links.css`, … | Component tokens, one file per component family; new components add a new category file to **every** mode |

Rules:

- **MUST** scope every declaration under `:root[data-fu-mode='<mode>']` — never bare `:root` (I2).
- **MUST** contain custom-property declarations only — no element, class, or attribute rules (I3). Anything that styles elements belongs in components or `assets/shared/`.
- **MUST** be plain CSS (`@import` + custom properties). No preprocessors.

## 4. Reserved second axis — `data-fu-scheme`

Dark mode is a non-goal ([00](00-overview.md)) but the grammar reserves room so a retrofit wouldn't require renames:

- The attribute `data-fu-scheme` on `<html>` and the token scope `:root[data-fu-mode='<mode>'][data-fu-scheme='<scheme>']` are **reserved** — nothing else may squat on them.
- If ever implemented: primitives stay per-mode; scheme variants override at the semantic/component layers under the combined scope. Token *names* never encode scheme (no `--fu-primary-dark-mode`).

No implementation work is planned; this section exists to keep the door open.

## 5. Token parity rule (I4)

Every mode **MUST** define the identical required token manifest: same primitives families, same 13 semantic aliases, same radius slots, same component-token sets. Extra mode-private tokens are not allowed — if one mode needs it, the manifest gains it and every mode defines it.

Rationale: parity is what makes components mode-agnostic — a component may consume any manifest token knowing it resolves in every mode. A missing token fails silently in CSS (property falls back or is ignored), which is why gaps are treated as bugs, not styling choices.

- Current deviation: **D3** — `defend` lacks `accent-beta`.
- Enforcement today: manual (diff the mode folders). A token-parity lint script is a roadmap tooling item ([06 §Tooling](06-roadmap.md)).

## 6. Per-mode component overrides — token-side policy (I6)

**Standard: token-side.** All per-mode differences live in mode files; components consume tokens and never mention mode names. This is what makes "adding a mode = adding a folder" true (§10) — no component edits, no grep across the kit.

`:global(:root[data-fu-mode='<mode>'])` inside a component is a **registered escape hatch**, permitted only when a mode needs a *structural* difference (different layout/DOM treatment, not different values) that tokens cannot express. Every use must be listed here:

| Component | Selector use | Verdict |
|---|---|---|
| `Badge.vue` — misc theme | Per-mode value overrides via `:global` | **D1** — values, not structure; migrate token-side (`--fu-badge-misc-*` tokens in each mode) |

No approved escape-hatch uses exist today.

## 7. Value sourcing rule (I5)

- Raw color values (hex/rgb/hsl) **MUST** appear only in the primitives layer.
- Semantic aliases and component tokens **MUST** be `var()` references to primitives (or to other tokens). Shadows may embed literal alpha colors until a shadow-primitive layer exists.
- Current deviation: **D2** — every `modes/*/buttons.css` hardcodes hex throughout, and several defend values aren't on defend's own ramps (defend's button family uses `#2970ff`/`#004eeb`/`#0040c1`, none of which appear in defend's `brand` ramp). Resolution (extend defend's ramps vs re-point at existing steps) is a design decision tracked in [06 §Now](06-roadmap.md).

## 8. What differs between current modes (informative)

| | defend | guard | expert |
|---|---|---|---|
| Radii | Pill controls (`9999px` button/tab/badge/tag/nav/avatar/featured-icon), cards 16–24px | Squared `8px` controls, cards 12–16px | Same as guard except `featured-icon: 9999px` |
| Brand ramp | Blue | Brighter blue | Stone/gray |
| `accent-alpha` | Purple | Fuchsia | Amber |
| `accent-beta` | **missing (D3)** | Blue | Indigo |
| `--fu-accent` → | `accent-alpha-500` | `accent-alpha-500` | `accent-beta-500` |

Raw size: ~11.5KB per mode (budget in [04 §5](04-css-delivery-and-performance.md)).

## 9. Shared CSS rules

`src/runtime/assets/shared/` is the only globally loaded CSS (I13) and **MUST** stay mode-independent: it may reference tokens (which resolve per mode) but must not contain mode-conditional selectors or raw visual values. Today it holds exactly `radius-utilities.css` — the 19 `.fu-radius-<slot>` classes mapping to the radius slots. Keep it small (budget: ≤2KB, [04 §5](04-css-delivery-and-performance.md)).

## 10. Adding a new mode — checklist

The `validate` mode ([06 §Next](06-roadmap.md)) executes exactly this list:

1. Extend the union in [src/runtime/types.ts](../../src/runtime/types.ts): `export type FuMode = … | "<mode>"`.
2. Create `src/runtime/assets/modes/<mode>/` with the **full manifest**: `index.css` (imports only), `colors.css` (all ramps incl. `accent-beta` + 13 aliases), `radiuses.css` (all 19 slots + 2 aliases), `buttons.css`, `links.css`, and every other category file existing modes have — all scoped `:root[data-fu-mode='<mode>']`.
3. Add the static import + map entry in [src/runtime/plugins/futurristic-init.ts](../../src/runtime/plugins/futurristic-init.ts). The `Record<FuMode, string>` type makes this a compile error if forgotten.
4. Add a playground page that calls `setMode('<mode>')` (mirror `playground/pages/guard.vue`) and a nav link in `playground/app.vue`.
5. Verify parity: diff the new folder's token names against an existing mode — zero missing, zero extra.
6. Update the mode lists in this doc (§1, §8) and [06-roadmap.md](06-roadmap.md).

Steps that are **not** required (by design): touching any component, touching `module.ts`, touching shared CSS.

## Known deviations

| ID | Deviation | Resolution |
|---|---|---|
| D1 | Badge misc theme overrides per mode inside the component (§6) | Migrate to `--fu-badge-misc-*` mode tokens — [06 §Now](06-roadmap.md) |
| D2 | `buttons.css` raw hex in all modes; defend values off-ramp (§7) | Re-point at primitives — [06 §Now](06-roadmap.md) |
| D3 | defend missing `accent-beta` (§2.1, §5) | Backfill ramp — [06 §Now](06-roadmap.md) |

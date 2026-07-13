# 06 — Roadmap

| | |
|---|---|
| Status | Draft (living document) |
| Last-verified | `dfcb150` |

Planned work in dependency order, not calendar order. Acceptance criteria live in the owning spec sections — items here point at them instead of restating.

## Graduation process

An item is **done** when: (1) the owning spec section is written/updated, (2) the code matches it, (3) the corresponding deviation entry is removed from the owning doc **and** the registry in [00-overview.md](00-overview.md). Specs and code ship in the same PR ([README](README.md) §Precedence).

## Now — hygiene (each item small, independent)

| Item | Deviation | Owning spec |
|---|---|---|
| Rewrite root `README.md` per the consumer-guide outline | D7 | [05 §3](05-module-config-and-dx.md) |
| Delete dead `src/scan-fu-icon-assets.ts` | D6 | [03 §7](03-icon-pipeline.md) |
| Commit `arrows` node map + run the export (93 icons) + regen types | D8 | [03 §5](03-icon-pipeline.md) |
| Add `:focus-visible` styling to `Button.vue` | D5 | [02 §1](02-component-standards.md) |
| Migrate Badge misc theme to `--fu-badge-misc-*` mode tokens (all modes) | D1 | [01 §6](01-style-modes-and-theming.md) |
| Backfill `accent-beta` ramp in `defend/colors.css` | D3 | [01 §5](01-style-modes-and-theming.md) |
| Re-point `modes/*/buttons.css` values at primitives; resolve defend's off-ramp button family (design decision: extend defend's ramps vs re-point at existing steps) | D2 | [01 §7](01-style-modes-and-theming.md) |

## Next — features

| Item | Detail | Owning spec |
|---|---|---|
| **`validate` mode** | Execute the adding-a-mode checklist verbatim. Concrete touches: `src/runtime/types.ts` (union), `src/runtime/assets/modes/validate/` (full manifest: index, colors incl. accent-beta, radiuses ×19+2, buttons, links), `src/runtime/plugins/futurristic-init.ts` (import + map entry — compile-enforced), playground page + nav link | [01 §10](01-style-modes-and-theming.md) |
| **Link → real `<a>`/NuxtLink** (resolves D4) | Preserve `ILinkProps` (internal/external union, themes, selected); swap render target; keep route-resolution warning behavior; ships as a documented DOM-structure change | [02 §9](02-component-standards.md), [05 §6](05-module-config-and-dx.md) |
| **`prefetchModes` option** | Implement the ratified opt-in design (default `false`; `rel="prefetch"` links for inactive modes) | [04 §3](04-css-delivery-and-performance.md) |

## Later — component pipeline

Radius slots already reserve token space for these ([01 §2.3](01-style-modes-and-theming.md)). No priority order — component groups are picked as internal projects need them. Each executes the adding-a-component checklist ([02 §7](02-component-standards.md)).

| Component | Radius slot(s) | Token readiness |
|---|---|---|
| Input / form field | `input`, `text-form` | slot only — needs `--fu-input-*` family |
| Tabs | `tab` | slot only |
| Card | `card-sm`, `card-md`, `card-sidebar` | slots only |
| Modal / Dialog | `modal` | slot only |
| Menu / Dropdown | `menu` | slot only; Link tertiary already covers menu rows |
| Tag | `tag` | slot only |
| NavItem | `nav-item` | slot only |
| Avatar | `avatar` | slot only |
| Tooltip | `tooltip` | slot only |
| FeaturedIcon | `featured-icon`, `icon-container` | slots only |
| Upload | `upload-base` | slot only |

Open flag: `text-form` and `result-panel` slots look application-specific rather than kit-generic — decide kit-worthiness when their component group comes up; drop the slots if not.

## Tooling

| Item | Purpose | Owning spec |
|---|---|---|
| Token-parity lint script | Diff mode folders' token names; fail CI on drift — turns [01 §5](01-style-modes-and-theming.md) from convention into gate | [01 §5](01-style-modes-and-theming.md) |
| CSS budget check | `wc -c`-grade CI assertion of [04 §5](04-css-delivery-and-performance.md) ceilings | [04 §5](04-css-delivery-and-performance.md) |
| Per-component render tests | Backfill the testing bar for Button/Link/Badge/Icon (today: one SSR smoke test) | [02 §6](02-component-standards.md) |

## Watchlist (no action yet)

- Component registration `global: true` — revisit at ~10 components or first heavyweight component ([04 §4](04-css-delivery-and-performance.md)).
- `data-fu-scheme` second axis — reserved, unplanned ([01 §4](01-style-modes-and-theming.md)).

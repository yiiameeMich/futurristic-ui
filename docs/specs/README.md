# futurristic-ui — Specification Suite

Binding specifications for `@yiiameemich/futurristic-ui`, the Nuxt UI-kit module with swappable style modes. These documents define how the module works today, the rules every future component and mode must follow, and the roadmap.

> The double **r** in "futurristic" is intentional (package name, config key, CSS prefixes). Do not "fix" it.

## How to read this suite

- **Module contributors**: read everything, starting at [00-overview.md](00-overview.md).
- **Consumers of the npm package**: start at [05-module-config-and-dx.md](05-module-config-and-dx.md).
- Each doc carries front-matter: `Status` (`Binding` = rules apply to all new work; `Draft` = proposal) and `Last-verified` (the commit the doc was checked against).

## Doc map

| Doc | Owns | Touch it when… |
|---|---|---|
| [00-overview.md](00-overview.md) | Architecture, runtime flow, invariants index, deviations registry | Any structural change to the module |
| [01-style-modes-and-theming.md](01-style-modes-and-theming.md) | Mode model, token grammar, mode CSS file contract, parity rule | Adding/changing a mode, adding tokens, theming decisions |
| [02-component-standards.md](02-component-standards.md) | Component authoring rules, props vocabulary, definition of done | Adding/changing any component |
| [03-icon-pipeline.md](03-icon-pipeline.md) | Figma export, SVG contract, type generation, Icon runtime | Adding icons/icon sets, touching icon scripts |
| [04-css-delivery-and-performance.md](04-css-delivery-and-performance.md) | How CSS reaches the browser, budgets, loading invariants | Touching the plugin, stylesheet injection, build output |
| [05-module-config-and-dx.md](05-module-config-and-dx.md) | Module options, composable API, packaging, versioning policy | Adding options, changing public API, publishing |
| [06-roadmap.md](06-roadmap.md) | Planned work, known-issue backlog, graduation process | Planning; when a deviation gets fixed |

Boundary worth remembering: **01 owns what mode CSS contains; 04 owns how it reaches the browser.**

## Precedence and amendments

1. Specs bind **new work**. Where existing code contradicts a spec, the divergence is listed in that doc's **Known deviations** section and linked to a roadmap item — never silently ignored, never silently "grandfathered".
2. A spec change ships **in the same PR** as the code it blesses. Code PRs that violate a `Binding` rule without amending the spec are rejected.
3. When two docs appear to conflict, 00-overview's invariants index wins; fix the conflicting doc.

## Glossary

| Term | Meaning |
|---|---|
| **Mode** | A brand theme (`defend`, `guard`, `expert`; `validate` planned). Not a light/dark color scheme. Exactly one is active per document, via `<html data-fu-mode="…">`. |
| **Token** | A `--fu-*` CSS custom property. Four layers: **primitive** (raw color ramps), **semantic** (role aliases like `--fu-primary`), **component** (per-component values defined in mode files, e.g. `--fu-btn-primary-main-bg`), **hook** (variant-less vars defined inside a component's own styles, e.g. `--fu-button-bg`). |
| **Mode file** | A CSS file under `src/runtime/assets/modes/<mode>/` whose declarations are all scoped to `:root[data-fu-mode='<mode>']`. |
| **`Fu` prefix** | Component name prefix (`<FuButton>`). Configurable via the `prefix` module option. |
| **`fu-` prefix** | CSS class prefix (`.fu-button`). Fixed — never affected by `prefix`. |
| **`--fu-` prefix** | Token prefix. Fixed — never affected by `prefix`. |

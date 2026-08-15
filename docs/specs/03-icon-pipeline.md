# 03 — Icon Pipeline

| | |
|---|---|
| Status | Binding |
| Last-verified | `0069507` |

Owns: how icons travel from Figma to a typed `<FuIcon>` render. Sets are directories; names are filenames; types are generated, never written.

## 1. Pipeline flow

```
Figma file (FILE_KEY M5Pmju2u0V1D44toH41Eoi)
   │  scripts/figma/<set>-icons.node-map.json   (node-id → icon name)
   ▼
scripts/figma/export-icons.mjs <set...|all>      (design-time, FIGMA_TOKEN, REST API)
   │  — OR, when refreshing/authoring node maps: Figma MCP connector
   │    (get_metadata for symbol id/name, get_design_context for asset URLs)
   │  fetches SVGs in chunks of 50, normalizes black/var(--x,black) → currentColor
   ▼
scripts/figma/normalize-icons.mjs <set...|all>   (idempotent post-processor)
   │  fixed 24×24 root, strips MCP wrapper cruft, reports leftover paints
   ▼
src/runtime/assets/icons/<set>/<name>.svg        (committed to git)
   ▼
scripts/lib/scan-fu-icon-assets.mjs              (canonical scanner + TS emitter)
   │  via scripts/generate-fu-icon-types.mjs     (postinstall / prepack / dev:prepare)
   ▼
src/runtime/types/icon-types.generated.ts        (gitignored — I10)
   │  FuIconRegistry, FuIconType, FuIconName<T>, IIconProps
   ▼
Icon.vue: import(`../assets/icons/${type}/${name}.svg?component`)
   ▼
per-icon lazy chunk, rendered inline, colored via currentColor
```

`scripts/figma/icon-sets.mjs` is the single source of truth for `FILE_KEY` and the `SETS` map (set name → Figma category frame node-id); both `export-icons.mjs` and `normalize-icons.mjs` import it.

Current inventory (19 sets, 1182 mapped SVGs + 2 legacy strays in `general`):

| set | count | | set | count | | set | count |
|---|---|---|---|---|---|---|---|
| general | 195 | | communication | 58 | | maps | 45 |
| media | 108 | | files | 57 | | charts | 49 |
| editor | 107 | | development | 57 | | weather | 52 |
| arrows | 93 | | layout | 63 | | education | 31 |
| finance | 79 | | security | 36 | | images | 29 |
| | | | users | 41 | | alerts | 28 |
| | | | | | | time | 28 |
| | | | | | | shapes | 26 |

Playground gallery at `playground/pages/icons.vue` renders every set (filterable, with a color swatch to verify `currentColor` theming) — dev-only, not shipped.

## 2. SVG contract

Every committed icon **MUST**:

- Live at `src/runtime/assets/icons/<set>/<name>.svg`; both `<set>` and `<name>` pass the safe-segment rule (non-empty, no `..`, `/`, `\`) — enforced at scan time and again at runtime.
- Use `currentColor` for themable strokes/fills. `export-icons.mjs` normalizes plain `black`; `normalize-icons.mjs` additionally handles the Figma-MCP-asset shape `var(--stroke-N, black)` and `#000`/`#000000`. Icons authored with other colors need manual attention (the normalizer's leftover-paint report flags them).
- Carry a `viewBox` (Figma exports do) — `Icon.vue` scales via `width/height: 100%`, sizing is the consumer's box.

## 3. Generation contract

- [scripts/lib/scan-fu-icon-assets.mjs](../../scripts/lib/scan-fu-icon-assets.mjs) is the **canonical** scanner/emitter (also consumed by vitest). `scanFuIconAssets(root)` → `{ set: sortedNames[] }`; `generateRuntimeIconTypesSource(registry)` emits the TS.
- [scripts/generate-fu-icon-types.mjs](../../scripts/generate-fu-icon-types.mjs) is the CLI wrapper with **src-vs-dist fallback**: reads `src/runtime/assets/icons` when present (repo dev), else `dist/runtime/assets/icons`, writing the generated file next to whichever exists. This is why postinstall works inside consumers — the published package ships `scripts/` + `dist/` ([05 §5](05-module-config-and-dx.md)).
- Runs on `postinstall`, `prepack`, `dev:prepare`. The output is gitignored and **MUST NOT** be hand-edited (I10).
- Emission shape: with ≥2 sets, `IIconProps` is a discriminated union — the default set's `iconType` is optional, every other set's is required. With 1 set, a plain object type; with 0, permissive strings.
- **Sync rule**: `FU_ICON_DEFAULT_TYPE = "general"` is declared in **two** places that MUST stay equal — [src/runtime/types/icon.ts](../../src/runtime/types/icon.ts) (runtime) and [scripts/lib/scan-fu-icon-assets.mjs](../../scripts/lib/scan-fu-icon-assets.mjs) (generator). Changing the default set means changing both (each carries a comment pointing at the other).

## 4. Runtime contract

- `Icon.vue` resolves icons via `defineAsyncComponent(() => import(\`../assets/icons/${type}/${name}.svg?component\`))`. **The template-string shape is load-bearing**: Vite turns it into a glob of `assets/icons/*/*.svg`, which is what makes every icon its own lazy chunk (I9) and lets `?component` (vite-svg-loader) produce an inline Vue component. Don't refactor the path into helpers/variables that break static analysis.
- `vite-svg-loader` is registered by the module with `defaultImport: "url"`; the `?component` suffix is a deliberate per-import override — inline SVG is required for `currentColor` inheritance.
- `safeSegment()` re-validates both segments at runtime, falling back to the default set / rendering nothing rather than importing an arbitrary path.
- Empty/missing `iconName` renders nothing (no placeholder box).

## 5. Adding icons or a new set — checklist

1. Add the set's name → Figma category frame node-id to `SETS` in [scripts/figma/icon-sets.mjs](../../scripts/figma/icon-sets.mjs).
2. Author `scripts/figma/<set>-icons.node-map.json` (node-id → kebab-case name). Two ways to get the id/name pairs:
   - **Figma MCP connector** (used to build all 19 current maps): `get_metadata` on the category frame returns every icon `<symbol id name>`; slugify names (`/^[a-z0-9][a-z0-9-]*$/`, hard-fail on collision, never auto-suffix) and write the map by hand/agent — there is no committed generator script for this path.
   - **Figma REST API** (`FIGMA_TOKEN`): if you already have a map from another source, skip straight to export.
3. Fetch SVGs: `FIGMA_TOKEN=… node scripts/figma/export-icons.mjs <set...|all>` (REST path; supports `--prune` to remove SVGs no longer in the map) — or, on the MCP path, `get_design_context` on the same frame for per-icon asset URLs and download them directly into `src/runtime/assets/icons/<set>/`.
4. Normalize: `node scripts/figma/normalize-icons.mjs <set...|all>`. Idempotent; review its leftover-paint warnings before committing.
5. Regenerate types: `npm run dev:prepare`.
6. Commit the SVGs + node map. Types stay gitignored.

## 6. Performance characteristics

Icons never load eagerly: no icon font, no sprite bundled into the entry, one HTTP-cacheable chunk per icon fetched on first render. 1182+ icons on disk cost consumers nothing until used. This is invariant I9; changes to icon delivery must preserve it or amend [04](04-css-delivery-and-performance.md).

## 7. Known deviations

| ID | Deviation | Resolution |
|---|---|---|
| D6 | [src/scan-fu-icon-assets.ts](../../src/scan-fu-icon-assets.ts) is a near-duplicate TS copy of the `.mjs` scanner whose doc comment describes an `addTypeTemplate` module integration that was never wired into `module.ts`. Dead code shadowing the canonical implementation. | Delete it (or implement the integration it describes — decision defaults to delete) — [06 §Now](06-roadmap.md) |
| D9 | `src/runtime/assets/icons/general/close.svg` and `general/test.svg` are committed but absent from `general-icons.node-map.json` (pre-date the pipeline); they leak into the generated type union. | Prune or add to the map — separate decision, not part of this change — [06 §Now](06-roadmap.md) |

D8 (arrows set unexported) is resolved: node map verified against Figma, 93 SVGs exported and normalized.

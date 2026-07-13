# 03 — Icon Pipeline

| | |
|---|---|
| Status | Binding |
| Last-verified | `dfcb150` |

Owns: how icons travel from Figma to a typed `<FuIcon>` render. Sets are directories; names are filenames; types are generated, never written.

## 1. Pipeline flow

```
Figma file (FILE_KEY M5Pmju2u0V1D44toH41Eoi)
   │  scripts/figma/<set>-icons.node-map.json   (node-id → icon name)
   ▼
scripts/figma/export-general-icons.mjs <set>     (design-time, FIGMA_TOKEN)
   │  fetches SVGs in chunks of 50, normalizes black → currentColor
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

Current inventory: `general` — 195 SVGs; `arrows` — node map exists (93 entries), zero SVGs exported (**D8**).

## 2. SVG contract

Every committed icon **MUST**:

- Live at `src/runtime/assets/icons/<set>/<name>.svg`; both `<set>` and `<name>` pass the safe-segment rule (non-empty, no `..`, `/`, `\`) — enforced at scan time and again at runtime.
- Use `currentColor` for themable strokes/fills. The export script normalizes `stroke="black"`/`fill="black"` → `currentColor`; icons authored with other colors need manual attention.
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

1. For a new set: create `scripts/figma/<set>-icons.node-map.json` (node-id → name) and add the set to `SET_CONFIG` in [scripts/figma/export-general-icons.mjs](../../scripts/figma/export-general-icons.mjs). Commit the node map.
2. Export: `FIGMA_TOKEN=… node scripts/figma/export-general-icons.mjs <set>`; check the "missing" warnings.
3. Spot-check normalized SVGs (`currentColor`, viewBox).
4. Regenerate types: `npm run dev:prepare` (or the generate script directly).
5. Commit the SVGs + node map. Types stay gitignored.

## 6. Performance characteristics

Icons never load eagerly: no icon font, no sprite bundled into the entry, one HTTP-cacheable chunk per icon fetched on first render. 195 icons on disk cost consumers nothing until used. This is invariant I9; changes to icon delivery must preserve it or amend [04](04-css-delivery-and-performance.md).

## 7. Known deviations

| ID | Deviation | Resolution |
|---|---|---|
| D6 | [src/scan-fu-icon-assets.ts](../../src/scan-fu-icon-assets.ts) is a near-duplicate TS copy of the `.mjs` scanner whose doc comment describes an `addTypeTemplate` module integration that was never wired into `module.ts`. Dead code shadowing the canonical implementation. | Delete it (or implement the integration it describes — decision defaults to delete) — [06 §Now](06-roadmap.md) |
| D8 | `arrows` set: 93-entry node map exists (currently untracked in git), 0 SVGs on disk, so the set is absent from generated types | Commit the node map + run the export — [06 §Now](06-roadmap.md) |

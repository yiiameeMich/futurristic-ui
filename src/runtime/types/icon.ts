import type { FuIconRegistry } from "./icon-types.generated";

/** Default icon folder; must match `FU_ICON_DEFAULT_TYPE` in `scripts/lib/scan-fu-icon-assets.mjs`. */
export const FU_ICON_DEFAULT_TYPE = "general" as const;

/** Literal icon types — file is gitignored; created by `scripts/generate-fu-icon-types.mjs` (postinstall / prepack / dev:prepare). */
export type { FuIconName, FuIconRegistry, FuIconType, IIconProps } from "./icon-types.generated";

/**
 * Every icon name across all sets, flattened into one union.
 * Names are not unique between sets (`colors` exists in `editor` and `images`),
 * so the paired `FuIconType` still selects the file — that pairing is not compile-checked.
 */
export type FuAnyIconName = keyof FuIconRegistry extends never ? string : FuIconRegistry[keyof FuIconRegistry];

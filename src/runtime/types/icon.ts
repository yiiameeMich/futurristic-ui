/** Default icon folder; must match `FU_ICON_DEFAULT_TYPE` in `scripts/lib/scan-fu-icon-assets.mjs`. */
export const FU_ICON_DEFAULT_TYPE = "general" as const;

/** Literal icon types — file is gitignored; created by `scripts/generate-fu-icon-types.mjs` (postinstall / prepack / dev:prepare). */
export type {
  FuIconName,
  FuIconRegistry,
  FuIconType,
  IIconProps,
} from "./icon-types.generated";

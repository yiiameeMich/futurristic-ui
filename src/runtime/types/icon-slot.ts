import type { Component } from "vue";
import type { FuAnyIconName, FuIconType } from "./icon";

/**
 * Prepend / append icon slots shared by `FuButton` and `FuLink`.
 *
 * Each slot accepts either a whole component (`prependIcon`) or a project icon
 * addressed by name (`prependIconName` + `prependIconType`). When both are set,
 * the component wins. `*IconClass` and `*IconColor` apply to whichever renders;
 * with no `*IconColor` the icon keeps inheriting the host's text color.
 */
export interface IIconSlotProps {
  prependIcon?: Component;
  prependIconName?: FuAnyIconName;
  /** Icon set the name lives in. Default: `FU_ICON_DEFAULT_TYPE` ('general'). */
  prependIconType?: FuIconType;
  prependIconClass?: string;
  /** Any CSS color value; omitted means inherit (`currentColor`). */
  prependIconColor?: string;
  appendIcon?: Component;
  appendIconName?: FuAnyIconName;
  /** Icon set the name lives in. Default: `FU_ICON_DEFAULT_TYPE` ('general'). */
  appendIconType?: FuIconType;
  appendIconClass?: string;
  /** Any CSS color value; omitted means inherit (`currentColor`). */
  appendIconColor?: string;
}

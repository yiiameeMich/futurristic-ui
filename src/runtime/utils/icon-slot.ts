import type { Component } from "vue";
import FuIcon from "../components/Icon.vue";
import type { FuAnyIconName, FuIconType } from "../types/icon";

export interface IResolvedIconSlot {
  is: Component;
  props: Record<string, unknown>;
}

/**
 * Pick what an icon slot renders: a passed component takes priority over a
 * project icon name; `null` means the slot renders nothing.
 */
export function resolveIconSlot(
  icon: Component | undefined,
  iconName: FuAnyIconName | undefined,
  iconType: FuIconType | undefined,
): IResolvedIconSlot | null {
  if (icon) {
    return { is: icon, props: {} };
  }

  if (iconName) {
    return { is: FuIcon, props: { iconName, iconType } };
  }

  return null;
}

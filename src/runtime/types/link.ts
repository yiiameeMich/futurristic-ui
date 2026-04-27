import type { Component } from "vue";
import type { RouteLocationRaw } from "vue-router";

export type { RouteLocationRaw };

export type TLinkTheme = "primary" | "secondary" | "tertiary";

type LinkChrome = {
  theme?: TLinkTheme;
  /** Menu / tertiary row: current route or active item (uses mode button radius, not pill). */
  selected?: boolean;
  prependIcon?: Component;
  prependIconClass?: string;
  appendIcon?: Component;
  appendIconClass?: string;
};

/** Internal: `destination` uses `T` (default `RouteLocationRaw`; use module augmentation / typed routes in the app to narrow). */
export type ILinkPropsInternal<T extends RouteLocationRaw = RouteLocationRaw> =
  LinkChrome & {
    external?: false;
    destination: T;
    disabled?: boolean;
  };

/** External: `destination` is always a string URL. */
export type ILinkPropsExternal = LinkChrome & {
  external: true;
  destination: string;
  disabled?: boolean;
};

export type ILinkProps<T extends RouteLocationRaw = RouteLocationRaw> =
  | ILinkPropsInternal<T>
  | ILinkPropsExternal;

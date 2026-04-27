import type { RouteLocationRaw } from "vue-router";

export type { RouteLocationRaw };

/** Internal: `destination` uses `T` (default `RouteLocationRaw`; use module augmentation / typed routes in the app to narrow). */
export type ILinkPropsInternal<T extends RouteLocationRaw = RouteLocationRaw> = {
  external?: false;
  destination: T;
  disabled?: boolean;
};

/** External: `destination` is always a string URL. */
export type ILinkPropsExternal = {
  external: true;
  destination: string;
  disabled?: boolean;
};

export type ILinkProps<T extends RouteLocationRaw = RouteLocationRaw> =
  | ILinkPropsInternal<T>
  | ILinkPropsExternal;

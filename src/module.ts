import {
  defineNuxtModule,
  addPlugin,
  addImportsDir,
  addComponentsDir,
  createResolver,
  extendViteConfig,
} from "@nuxt/kit";
import svgLoader from "vite-svg-loader";
import { defu } from "defu";
import type { FuMode } from "./runtime/types";

export type { FuMode };
export type { FuConfig } from "./runtime/types";
export type {
  ILinkProps,
  ILinkPropsExternal,
  ILinkPropsInternal,
  RouteLocationRaw,
  TLinkTheme,
} from "./runtime/types/link";
export type { IIconProps } from "./runtime/types/icon";
// TODO: Make buttons and other component more a11y-friendly
export interface ModuleOptions {
  /** Active color/style mode. Default: 'defend' */
  mode?: FuMode;
  /** Prefix for auto-imported components. Default: 'Fu' */
  prefix?: string;
}

declare module "@nuxt/schema" {
  interface PublicRuntimeConfig {
    futurristic: {
      mode: FuMode;
    };
  }
  interface NuxtConfig {
    futurristic?: ModuleOptions;
  }
  interface NuxtOptions {
    futurristic?: ModuleOptions;
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "@yiiameemich/futurristic-ui",
    configKey: "futurristic",
    compatibility: {
      nuxt: "^3.0.0 || ^4.0.0",
    },
  },
  defaults: {
    mode: "defend",
    prefix: "Fu",
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);

    extendViteConfig((config) => {
      config.plugins ??= [];
      config.plugins.push(
        svgLoader({
          defaultImport: "url",
        }),
      );
    });

    // Expose initial mode to runtime via public runtimeConfig
    nuxt.options.runtimeConfig.public.futurristic = defu(
      nuxt.options.runtimeConfig.public.futurristic,
      { mode: options.mode ?? "defend" },
    );

    // Shared utility classes used by runtime components
    nuxt.options.css.push(
      resolver.resolve("./runtime/assets/shared/radius-utilities.css"),
    );

    // Auto-register all components under the chosen prefix
    addComponentsDir({
      path: resolver.resolve("./runtime/components"),
      prefix: options.prefix ?? "Fu",
      global: true,
    });

    // Auto-import composables (useFuturristic)
    addImportsDir(resolver.resolve("./runtime/composables"));

    // Plugin: bind initial mode to <html data-fu-mode="...">
    addPlugin(resolver.resolve("./runtime/plugins/futurristic-init"));
  },
});

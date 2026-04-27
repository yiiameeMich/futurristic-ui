import { useState, useRuntimeConfig } from "#app";
import { readonly } from "vue";
import type { FuMode, FuConfig } from "../types";

export { type FuMode, type FuConfig };

export const useFuturristic = () => {
  const runtimeConfig = useRuntimeConfig();

  const mode = useState<FuMode>(
    "futurristic-mode",
    () => (runtimeConfig.public.futurristic?.mode ?? "defend") satisfies FuMode,
  );

  const setMode = (newMode: FuMode) => {
    mode.value = newMode;

    if (import.meta.client) {
      document.documentElement.dataset.fuMode = newMode;
    }
  };

  const setConfig = (config: Partial<FuConfig>) => {
    if (config.mode) {
      setMode(config.mode);
    }
  };

  return {
    mode: readonly(mode),
    setMode,
    setConfig,
  };
};

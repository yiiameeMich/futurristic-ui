import { computed } from "vue";
import { defineNuxtPlugin, useHead } from "#app";
import { useFuturristic } from "../composables/useFuturristic";
import type { FuMode } from "../types";
import defendModeStylesheetUrl from "../assets/modes/defend/index.css?url";
import guardModeStylesheetUrl from "../assets/modes/guard/index.css?url";
import expertModeStylesheetUrl from "../assets/modes/expert/index.css?url";

const modeStylesheetMap: Record<FuMode, string> = {
  defend: defendModeStylesheetUrl,
  guard: guardModeStylesheetUrl,
  expert: expertModeStylesheetUrl,
};

export default defineNuxtPlugin(() => {
  const { mode } = useFuturristic();
  const modeStylesheetUrl = computed(() => modeStylesheetMap[mode.value]);

  useHead(() => ({
    htmlAttrs: { "data-fu-mode": mode.value },
    link: [
      {
        key: "fu-mode-stylesheet",
        rel: "stylesheet",
        href: modeStylesheetUrl.value,
      },
    ],
  }));
});

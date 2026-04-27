<script setup lang="ts">
import { computed, defineAsyncComponent } from "vue";
import type { IIconProps } from "../types/icon";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<IIconProps>(), {
  iconName: undefined,
  iconType: "general",
});

function safeSegment(value: string | undefined, fallback: string) {
  const v = (value ?? fallback).trim();

  if (!v || v.includes("..") || v.includes("/") || v.includes("\\")) {
    return fallback;
  }

  return v;
}

const asyncSvg = computed(() => {
  const rawName = props.iconName?.trim();

  if (!rawName) {
    return null;
  }

  const type = safeSegment(props.iconType, "general");
  const name = safeSegment(rawName, "");

  if (!name) {
    return null;
  }

  return defineAsyncComponent(
    () => import(`../assets/icons/${type}/${name}.svg?component`),
  );
});
</script>

<template>
  <component
    :is="asyncSvg"
    v-if="asyncSvg"
    class="fu-icon"
    focusable="false"
    v-bind="$attrs"
  />
</template>

<style scoped>
.fu-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  flex-shrink: 0;
  vertical-align: -0.125em;
  color: inherit;
}

.fu-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>

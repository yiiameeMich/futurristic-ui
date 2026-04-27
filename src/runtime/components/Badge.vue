<script setup lang="ts">
defineOptions({ inheritAttrs: false });

export type TBadgeTheme =
  | "success"
  | "misc"
  | "danger"
  | "warning"
  | "neutral";

export interface IBadgeProps {
  theme?: TBadgeTheme;
}

const props = withDefaults(defineProps<IBadgeProps>(), {
  theme: "neutral",
});
</script>

<template>
  <span
    v-bind="$attrs"
    :class="['fu-badge', `fu-badge--theme-${props.theme}`]"
  >
    <slot />
  </span>
</template>

<style scoped>
.fu-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
  padding: 4px 10px;
  border: 1px solid var(--fu-badge-border);
  border-radius: var(--fu-radius-badge);
  background-color: var(--fu-badge-bg);
  color: var(--fu-badge-text);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  white-space: nowrap;
}

.fu-badge--theme-success {
  --fu-badge-bg: var(--fu-color-success-50);
  --fu-badge-border: var(--fu-color-success-100);
  --fu-badge-text: var(--fu-color-success-600);
}

.fu-badge--theme-misc {
  --fu-badge-bg: var(--fu-color-accent-alpha-50);
  --fu-badge-border: var(--fu-color-accent-alpha-100);
  --fu-badge-text: var(--fu-color-accent-alpha-600);
}

:global(:root[data-fu-mode="guard"]) .fu-badge--theme-misc {
  --fu-badge-bg: var(--fu-btn-primary-subtle-bg-hover);
  --fu-badge-border: var(--fu-btn-primary-subtle-border-border);
  --fu-badge-text: var(--fu-btn-primary-subtle-text);
}

:global(:root[data-fu-mode="expert"]) .fu-badge--theme-misc {
  --fu-badge-bg: var(--fu-color-accent-beta-50);
  --fu-badge-border: var(--fu-color-accent-beta-200);
  --fu-badge-text: var(--fu-color-accent-beta-600);
}

.fu-badge--theme-danger {
  --fu-badge-bg: var(--fu-color-error-50);
  --fu-badge-border: var(--fu-color-error-200);
  --fu-badge-text: var(--fu-color-error-600);
}

.fu-badge--theme-warning {
  --fu-badge-bg: var(--fu-color-warning-50);
  --fu-badge-border: var(--fu-color-warning-100);
  --fu-badge-text: var(--fu-color-warning-600);
}

.fu-badge--theme-neutral {
  --fu-badge-bg: var(--fu-color-gray-100);
  --fu-badge-border: var(--fu-color-gray-200);
  --fu-badge-text: var(--fu-color-gray-900);
}
</style>

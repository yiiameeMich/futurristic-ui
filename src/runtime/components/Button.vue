<script setup lang="ts">
import { computed } from "vue";
import { FU_ICON_DEFAULT_TYPE } from "../types/icon";
import type { IIconSlotProps } from "../types/icon-slot";
import { resolveIconSlot } from "../utils/icon-slot";

defineOptions({ inheritAttrs: false });

export interface IButtonProps extends IIconSlotProps {
  theme?: "primary" | "secondary";
  type?: "main" | "subtle" | "subtle-border" | "subtle-lift";
  size?: "sm" | "md" | "lg" | "xl";
  disabled?: boolean;
  iconOnly?: boolean;
}

const props = withDefaults(defineProps<IButtonProps>(), {
  theme: "primary",
  type: "main",
  size: "md",
  disabled: false,
  iconOnly: false,
  prependIcon: undefined,
  prependIconName: undefined,
  prependIconType: FU_ICON_DEFAULT_TYPE,
  prependIconClass: "",
  prependIconColor: undefined,
  appendIcon: undefined,
  appendIconName: undefined,
  appendIconType: FU_ICON_DEFAULT_TYPE,
  appendIconClass: "",
  appendIconColor: undefined,
});

const prependIconSlot = computed(() =>
  resolveIconSlot(props.prependIcon, props.prependIconName, props.prependIconType),
);

const appendIconSlot = computed(() => resolveIconSlot(props.appendIcon, props.appendIconName, props.appendIconType));
</script>

<template>
  <button
    v-bind="$attrs"
    :class="[
      'fu-button',
      'fu-radius-button',
      `fu-button--theme-${theme}`,
      `fu-button--type-${type}`,
      `fu-button--${size}`,
      { 'fu-button--icon-only': iconOnly },
      { 'fu-button--disabled': disabled },
    ]"
    :disabled="disabled"
  >
    <component
      :is="prependIconSlot.is"
      v-if="prependIconSlot"
      v-bind="prependIconSlot.props"
      :class="['fu-button__icon', prependIconClass]"
      :style="prependIconColor ? { color: prependIconColor } : undefined"
    />
    <slot />
    <component
      :is="appendIconSlot.is"
      v-if="appendIconSlot"
      v-bind="appendIconSlot.props"
      :class="['fu-button__icon', appendIconClass]"
      :style="appendIconColor ? { color: appendIconColor } : undefined"
    />
  </button>
</template>

<style scoped>
.fu-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border: 1px solid var(--fu-button-border-color);
  background-color: var(--fu-button-bg);
  color: var(--fu-button-text);
  cursor: pointer;
  font-family: inherit;
  box-shadow: var(--fu-button-shadow, none);
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
}

.fu-button--sm {
  --fu-icon-size: 20px;
  height: 36px;
  gap: 4px;
  padding: 7px 12px;
  font-size: 0.875rem;
  line-height: 22px;
}
.fu-button--md {
  --fu-icon-size: 20px;
  height: 44px;
  gap: 4px;
  padding: 11px 14px;
  font-size: 0.875rem;
  line-height: 22px;
}
.fu-button--lg {
  --fu-icon-size: 24px;
  height: 48px;
  gap: 6px;
  padding: 12px 16px;
  font-size: 1rem;
  line-height: 26px;
}
.fu-button--xl {
  --fu-icon-size: 24px;
  height: 56px;
  gap: 6px;
  padding: 16px 18px;
  font-size: 1rem;
  line-height: 26px;
}

.fu-button:hover:not(:disabled) {
  background-color: var(--fu-button-bg-hover);
  border-color: var(--fu-button-border-color-hover);
  color: var(--fu-button-text-hover);
  box-shadow: var(--fu-button-shadow-hover, var(--fu-button-shadow, none));
}

.fu-button:active:not(:disabled) {
  background-color: var(--fu-button-bg-active);
  border-color: var(--fu-button-border-color-active);
  color: var(--fu-button-text-active);
  box-shadow: var(
    --fu-button-shadow-active,
    var(--fu-button-shadow-hover, var(--fu-button-shadow, none))
  );
}

.fu-button--disabled,
.fu-button:disabled {
  background-color: var(--fu-button-bg-disabled);
  border-color: var(--fu-button-border-color-disabled);
  color: var(--fu-button-text-disabled);
  box-shadow: none;
  cursor: not-allowed;
}

.fu-button__icon {
  flex-shrink: 0;
  /* Floor only — the SVG markup still decides the rendered width/height. */
  min-width: var(--fu-icon-size);
  min-height: var(--fu-icon-size);
}

.fu-button--icon-only {
  border-radius: var(--fu-radius-button-icon-only);
}

/* theme: primary */
.fu-button--theme-primary.fu-button--type-main {
  --fu-button-bg: var(--fu-btn-primary-main-bg);
  --fu-button-border-color: var(--fu-btn-primary-main-border);
  --fu-button-text: var(--fu-btn-primary-main-text);
  --fu-button-bg-hover: var(--fu-btn-primary-main-bg-hover);
  --fu-button-border-color-hover: var(--fu-btn-primary-main-border-hover);
  --fu-button-text-hover: var(--fu-btn-primary-main-text-hover);
  --fu-button-bg-active: var(--fu-btn-primary-main-bg-active);
  --fu-button-border-color-active: var(--fu-btn-primary-main-border-active);
  --fu-button-text-active: var(--fu-btn-primary-main-text-active);
  --fu-button-bg-disabled: var(--fu-btn-primary-main-bg-disabled);
  --fu-button-border-color-disabled: var(--fu-btn-primary-main-border-disabled);
  --fu-button-text-disabled: var(--fu-btn-primary-main-text-disabled);
}

.fu-button--theme-primary.fu-button--type-subtle {
  --fu-button-bg: var(--fu-btn-primary-subtle-bg);
  --fu-button-border-color: var(--fu-btn-primary-subtle-border);
  --fu-button-text: var(--fu-btn-primary-subtle-text);
  --fu-button-bg-hover: var(--fu-btn-primary-subtle-bg-hover);
  --fu-button-border-color-hover: var(--fu-btn-primary-subtle-border-hover);
  --fu-button-text-hover: var(--fu-btn-primary-subtle-text-hover);
  --fu-button-bg-active: var(--fu-btn-primary-subtle-bg-active);
  --fu-button-border-color-active: var(--fu-btn-primary-subtle-border-active);
  --fu-button-text-active: var(--fu-btn-primary-subtle-text-active);
  --fu-button-bg-disabled: var(--fu-btn-primary-subtle-bg-disabled);
  --fu-button-border-color-disabled: var(
    --fu-btn-primary-subtle-border-disabled
  );
  --fu-button-text-disabled: var(--fu-btn-primary-subtle-text-disabled);
}

.fu-button--theme-primary.fu-button--type-subtle-border {
  --fu-button-bg: var(--fu-btn-primary-subtle-border-bg);
  --fu-button-border-color: var(--fu-btn-primary-subtle-border-border);
  --fu-button-text: var(--fu-btn-primary-subtle-border-text);
  --fu-button-bg-hover: var(--fu-btn-primary-subtle-border-bg-hover);
  --fu-button-border-color-hover: var(
    --fu-btn-primary-subtle-border-border-hover
  );
  --fu-button-text-hover: var(--fu-btn-primary-subtle-border-text-hover);
  --fu-button-bg-active: var(--fu-btn-primary-subtle-border-bg-active);
  --fu-button-border-color-active: var(
    --fu-btn-primary-subtle-border-border-active
  );
  --fu-button-text-active: var(--fu-btn-primary-subtle-border-text-active);
  --fu-button-bg-disabled: var(--fu-btn-primary-subtle-border-bg-disabled);
  --fu-button-border-color-disabled: var(
    --fu-btn-primary-subtle-border-border-disabled
  );
  --fu-button-text-disabled: var(--fu-btn-primary-subtle-border-text-disabled);
}

.fu-button--theme-primary.fu-button--type-subtle-lift {
  --fu-button-bg: var(--fu-btn-primary-subtle-lift-bg);
  --fu-button-border-color: var(--fu-btn-primary-subtle-lift-border);
  --fu-button-text: var(--fu-btn-primary-subtle-lift-text);
  --fu-button-shadow: var(--fu-btn-primary-subtle-lift-shadow);
  --fu-button-bg-hover: var(--fu-btn-primary-subtle-lift-bg-hover);
  --fu-button-border-color-hover: var(
    --fu-btn-primary-subtle-lift-border-hover
  );
  --fu-button-text-hover: var(--fu-btn-primary-subtle-lift-text-hover);
  --fu-button-shadow-hover: var(--fu-btn-primary-subtle-lift-shadow-hover);
  --fu-button-bg-active: var(--fu-btn-primary-subtle-lift-bg-active);
  --fu-button-border-color-active: var(
    --fu-btn-primary-subtle-lift-border-active
  );
  --fu-button-text-active: var(--fu-btn-primary-subtle-lift-text-active);
  --fu-button-shadow-active: var(--fu-btn-primary-subtle-lift-shadow-active);
  --fu-button-bg-disabled: var(--fu-btn-primary-subtle-lift-bg-disabled);
  --fu-button-border-color-disabled: var(
    --fu-btn-primary-subtle-lift-border-disabled
  );
  --fu-button-text-disabled: var(--fu-btn-primary-subtle-lift-text-disabled);
}

/* theme: secondary */
.fu-button--theme-secondary.fu-button--type-main {
  --fu-button-bg: var(--fu-btn-secondary-main-bg);
  --fu-button-border-color: var(--fu-btn-secondary-main-border);
  --fu-button-text: var(--fu-btn-secondary-main-text);
  --fu-button-bg-hover: var(--fu-btn-secondary-main-bg-hover);
  --fu-button-border-color-hover: var(--fu-btn-secondary-main-border-hover);
  --fu-button-text-hover: var(--fu-btn-secondary-main-text-hover);
  --fu-button-bg-active: var(--fu-btn-secondary-main-bg-active);
  --fu-button-border-color-active: var(--fu-btn-secondary-main-border-active);
  --fu-button-text-active: var(--fu-btn-secondary-main-text-active);
  --fu-button-bg-disabled: var(--fu-btn-secondary-main-bg-disabled);
  --fu-button-border-color-disabled: var(
    --fu-btn-secondary-main-border-disabled
  );
  --fu-button-text-disabled: var(--fu-btn-secondary-main-text-disabled);
}

.fu-button--theme-secondary.fu-button--type-subtle {
  --fu-button-bg: var(--fu-btn-secondary-subtle-bg);
  --fu-button-border-color: var(--fu-btn-secondary-subtle-border);
  --fu-button-text: var(--fu-btn-secondary-subtle-text);
  --fu-button-bg-hover: var(--fu-btn-secondary-subtle-bg-hover);
  --fu-button-border-color-hover: var(--fu-btn-secondary-subtle-border-hover);
  --fu-button-text-hover: var(--fu-btn-secondary-subtle-text-hover);
  --fu-button-bg-active: var(--fu-btn-secondary-subtle-bg-active);
  --fu-button-border-color-active: var(--fu-btn-secondary-subtle-border-active);
  --fu-button-text-active: var(--fu-btn-secondary-subtle-text-active);
  --fu-button-bg-disabled: var(--fu-btn-secondary-subtle-bg-disabled);
  --fu-button-border-color-disabled: var(
    --fu-btn-secondary-subtle-border-disabled
  );
  --fu-button-text-disabled: var(--fu-btn-secondary-subtle-text-disabled);
}

.fu-button--theme-secondary.fu-button--type-subtle-border {
  --fu-button-bg: var(--fu-btn-secondary-subtle-border-bg);
  --fu-button-border-color: var(--fu-btn-secondary-subtle-border-border);
  --fu-button-text: var(--fu-btn-secondary-subtle-border-text);
  --fu-button-bg-hover: var(--fu-btn-secondary-subtle-border-bg-hover);
  --fu-button-border-color-hover: var(
    --fu-btn-secondary-subtle-border-border-hover
  );
  --fu-button-text-hover: var(--fu-btn-secondary-subtle-border-text-hover);
  --fu-button-bg-active: var(--fu-btn-secondary-subtle-border-bg-active);
  --fu-button-border-color-active: var(
    --fu-btn-secondary-subtle-border-border-active
  );
  --fu-button-text-active: var(--fu-btn-secondary-subtle-border-text-active);
  --fu-button-bg-disabled: var(--fu-btn-secondary-subtle-border-bg-disabled);
  --fu-button-border-color-disabled: var(
    --fu-btn-secondary-subtle-border-border-disabled
  );
  --fu-button-text-disabled: var(
    --fu-btn-secondary-subtle-border-text-disabled
  );
}

.fu-button--theme-secondary.fu-button--type-subtle-lift {
  --fu-button-bg: var(--fu-btn-secondary-subtle-lift-bg);
  --fu-button-border-color: var(--fu-btn-secondary-subtle-lift-border);
  --fu-button-text: var(--fu-btn-secondary-subtle-lift-text);
  --fu-button-shadow: var(--fu-btn-secondary-subtle-lift-shadow);
  --fu-button-bg-hover: var(--fu-btn-secondary-subtle-lift-bg-hover);
  --fu-button-border-color-hover: var(
    --fu-btn-secondary-subtle-lift-border-hover
  );
  --fu-button-text-hover: var(--fu-btn-secondary-subtle-lift-text-hover);
  --fu-button-shadow-hover: var(--fu-btn-secondary-subtle-lift-shadow-hover);
  --fu-button-bg-active: var(--fu-btn-secondary-subtle-lift-bg-active);
  --fu-button-border-color-active: var(
    --fu-btn-secondary-subtle-lift-border-active
  );
  --fu-button-text-active: var(--fu-btn-secondary-subtle-lift-text-active);
  --fu-button-shadow-active: var(--fu-btn-secondary-subtle-lift-shadow-active);
  --fu-button-bg-disabled: var(--fu-btn-secondary-subtle-lift-bg-disabled);
  --fu-button-border-color-disabled: var(
    --fu-btn-secondary-subtle-lift-border-disabled
  );
  --fu-button-text-disabled: var(--fu-btn-secondary-subtle-lift-text-disabled);
}
</style>

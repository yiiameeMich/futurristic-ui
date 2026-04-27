<script
  setup
  lang="ts"
  generic="TInternal extends RouteLocationRaw = RouteLocationRaw"
>
import type { Component } from "vue";
import type { RouteLocationRaw } from "vue-router";
import { navigateTo, useRouter } from "#app";
import type { ILinkProps } from "../types/link";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ILinkProps<TInternal>>(), {
  theme: "primary",
  selected: false,
  external: false,
  disabled: false,
  prependIcon: undefined,
  prependIconClass: "",
  appendIcon: undefined,
  appendIconClass: "",
});

const router = useRouter();

const canResolveInternalRoute = (destination: RouteLocationRaw) => {
  try {
    const resolved = router.resolve(destination);
    return resolved.matched.length > 0;
  } catch {
    return false;
  }
};

const onActivate = async () => {
  if (props.disabled) {
    return;
  }

  if (props.external) {
    await navigateTo(props.destination, { external: true });
    return;
  }

  const destination = props.destination;

  if (!canResolveInternalRoute(destination)) {
    console.warn(
      "[futurristic-ui] Internal link destination is not a known route:",
      destination,
    );
    return;
  }

  await navigateTo(destination);
};
</script>

<template>
  <button
    v-bind="$attrs"
    type="button"
    role="link"
    class="fu-link"
    :class="[
      `fu-link--theme-${theme}`,
      {
        'fu-link--selected': selected && theme === 'tertiary',
        'fu-link--disabled': disabled,
      },
    ]"
    :disabled="disabled"
    :aria-current="selected && theme === 'tertiary' ? 'page' : undefined"
    @click="onActivate"
  >
    <component
      :is="prependIcon"
      v-if="prependIcon"
      :class="['fu-link__icon', prependIconClass]"
    />
    <span class="fu-link__label">
      <slot />
    </span>
    <component
      :is="appendIcon"
      v-if="appendIcon"
      :class="['fu-link__icon', appendIconClass]"
    />
  </button>
</template>

<style scoped>
.fu-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 1px solid transparent;
  margin: 0;
  background: transparent;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 22px;
  text-decoration: none;
  cursor: pointer;
  color: var(--fu-link-fg);
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease,
    opacity 0.15s ease;
}

.fu-link__label {
  white-space: nowrap;
}

.fu-link__icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: inherit;
}

/* Primary / secondary: UI kit inline links (gap 6, py 4, semibold) */
.fu-link--theme-primary,
.fu-link--theme-secondary {
  gap: 6px;
  padding: 4px 0;
  font-weight: 600;
  border-radius: 0;
}

.fu-link--theme-primary {
  --fu-link-fg: var(--fu-btn-primary-link-text);
  --fu-link-fg-hover: var(--fu-btn-primary-link-text-hover);
  --fu-link-fg-active: var(--fu-btn-primary-link-text-active);
  --fu-link-fg-disabled: var(--fu-btn-primary-link-text-disabled);
}

.fu-link--theme-secondary {
  --fu-link-fg: var(--fu-link-secondary-fg);
  --fu-link-fg-hover: var(--fu-link-secondary-fg-hover);
  --fu-link-fg-active: var(--fu-link-secondary-fg-active);
  --fu-link-fg-disabled: var(--fu-link-secondary-fg-disabled);
}

/* Tertiary (menu): regular weight, horizontal padding; selected uses button radius per mode */
.fu-link--theme-tertiary {
  gap: 8px;
  padding: 4px 8px;
  font-weight: 400;
  --fu-link-fg: var(--fu-link-tertiary-fg);
  --fu-link-fg-hover: var(--fu-link-tertiary-fg-hover);
  --fu-link-fg-active: var(--fu-link-tertiary-fg-hover);
  --fu-link-fg-disabled: var(--fu-link-tertiary-fg-disabled);
}

.fu-link--theme-tertiary.fu-link--selected {
  background-color: var(--fu-link-tertiary-bg-selected);
  color: var(--fu-link-tertiary-fg-selected);
  border-radius: var(--fu-radius-button);
}

.fu-link--theme-tertiary.fu-link--selected:hover:not(:disabled):not(
    .fu-link--disabled
  ),
.fu-link--theme-tertiary.fu-link--selected:active:not(:disabled):not(
    .fu-link--disabled
  ) {
  color: var(--fu-link-tertiary-fg-selected);
}

.fu-link:hover:not(:disabled):not(.fu-link--disabled) {
  color: var(--fu-link-fg-hover);
}

.fu-link:active:not(:disabled):not(.fu-link--disabled) {
  color: var(--fu-link-fg-active);
}

.fu-link:focus-visible {
  outline: 2px solid var(--fu-color-brand-300);
  outline-offset: 2px;
}

.fu-link--theme-secondary:focus-visible {
  outline-color: var(--fu-color-gray-300);
}

.fu-link--theme-tertiary:focus-visible {
  outline-color: var(--fu-color-gray-300);
}

.fu-link--disabled,
.fu-link:disabled {
  color: var(--fu-link-fg-disabled);
  cursor: not-allowed;
  opacity: 1;
}
</style>

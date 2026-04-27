<script
  setup
  lang="ts"
  generic="TInternal extends RouteLocationRaw = RouteLocationRaw"
>
import type { RouteLocationRaw } from "vue-router";
import { navigateTo, useRouter } from "#app";
import type { ILinkProps } from "../types/link";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<ILinkProps<TInternal>>(), {
  external: false,
  disabled: false,
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
  return;
};
</script>

<template>
  <button
    v-bind="$attrs"
    class="fu-link"
    type="button"
    role="link"
    :disabled="disabled"
    :class="{ 'fu-link--disabled': disabled }"
    @click="onActivate"
  >
    <slot />
  </button>
</template>

<style scoped>
.fu-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  padding: 0;
  margin: 0;
  background: transparent;
  color: var(--fu-primary);
  font: inherit;
  font-weight: 600;
  line-height: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  transition:
    color 0.15s ease,
    opacity 0.15s ease;
}

.fu-link:hover:not(:disabled) {
  color: var(--fu-primary-dark);
}

.fu-link:focus-visible {
  outline: 2px solid var(--fu-primary-light);
  outline-offset: 2px;
}

.fu-link--disabled,
.fu-link:disabled {
  color: var(--fu-color-gray-400);
  text-decoration: none;
  cursor: not-allowed;
}
</style>

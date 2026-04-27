<template>
  <div class="page">
    <header class="page__header">
      <h1>{{ title }}</h1>
      <span class="page__mode-chip">Mode: {{ mode }}</span>
    </header>

    <main class="page__main">
      <section class="theme-block">
        <h2>badges</h2>
        <article class="type-block">
          <h3>themes</h3>
          <div class="row">
            <FuBadge
              v-for="badgeTheme in badgeThemes"
              :key="`badge-${badgeTheme}`"
              :theme="badgeTheme"
            >
              {{ badgeLabels[badgeTheme] }}
            </FuBadge>
          </div>
        </article>
      </section>

      <section v-for="theme in themes" :key="theme" class="theme-block">
        <h2>{{ theme }}</h2>

        <article
          v-for="buttonType in types"
          :key="`${theme}-${buttonType}`"
          class="type-block"
        >
          <h3>{{ buttonType }}</h3>

          <div
            v-for="state in states"
            :key="`${theme}-${buttonType}-${state}`"
            class="state-row"
          >
            <p class="state-row__label">{{ state }}</p>
            <div class="row">
              <FuButton
                v-for="size in sizes"
                :key="`${theme}-${buttonType}-${state}-${size}`"
                :theme="theme"
                :type="buttonType"
                :size="size"
                :disabled="state === 'disabled'"
                :class="
                  state === 'disabled' ? undefined : `preview-state--${state}`
                "
              >
                Button CTA
              </FuButton>
            </div>
          </div>
        </article>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { IButtonProps } from "../../src/runtime/components/Button.vue";
import type {
  IBadgeProps,
  TBadgeTheme,
} from "../../src/runtime/components/Badge.vue";
import type { FuMode } from "../../src/runtime/types";

const props = defineProps<{
  mode: FuMode;
  title: string;
}>();

const { setMode } = useFuturristic();

const themes: NonNullable<IButtonProps["theme"]>[] = ["primary", "secondary"];
const types: NonNullable<IButtonProps["type"]>[] = [
  "main",
  "subtle",
  "subtle-border",
  "subtle-lift",
  "link",
];
const sizes: NonNullable<IButtonProps["size"]>[] = ["sm", "md", "lg", "xl"];
const states = ["default", "hover", "active", "disabled"] as const;
const badgeThemes: NonNullable<IBadgeProps["theme"]>[] = [
  "success",
  "misc",
  "danger",
  "warning",
  "neutral",
];
const badgeLabels: Record<TBadgeTheme, string> = {
  success: "New",
  misc: "Words",
  danger: "Error",
  warning: "Warning",
  neutral: "Neutral",
};

setMode(props.mode);
</script>

<style scoped>
.page {
  min-height: 100vh;
}

.page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--fu-border);
  background-color: var(--fu-surface-raised);
}

.page__header h1 {
  margin: 0;
  font-size: 1.25rem;
}

.page__mode-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem 0.625rem;
  border-radius: var(--fu-radius-badge);
  background-color: var(--fu-border);
  color: var(--fu-on-surface);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.25rem;
}

.page__main {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1100px;
}

.theme-block {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.theme-block h2 {
  margin: 0;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--fu-secondary);
}

.type-block {
  background: var(--fu-surface-raised);
  border: 1px solid var(--fu-border);
  border-radius: var(--fu-radius-card-sm);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.type-block h3 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--fu-on-surface);
  text-transform: capitalize;
}

.state-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.state-row__label {
  margin: 0;
  font-size: 0.75rem;
  line-height: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--fu-secondary);
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

:deep(.preview-state--hover) {
  background-color: var(--fu-button-bg-hover);
  border-color: var(--fu-button-border-color-hover);
  color: var(--fu-button-text-hover);
  box-shadow: var(--fu-button-shadow-hover, var(--fu-button-shadow, none));
}

:deep(.preview-state--active) {
  background-color: var(--fu-button-bg-active);
  border-color: var(--fu-button-border-color-active);
  color: var(--fu-button-text-active);
  box-shadow: var(
    --fu-button-shadow-active,
    var(--fu-button-shadow-hover, var(--fu-button-shadow, none))
  );
}
</style>

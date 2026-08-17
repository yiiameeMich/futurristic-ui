<template>
  <div class="page">
    <header class="page__header">
      <h1>{{ title }}</h1>
      <span class="page__mode-chip">Mode: {{ mode }}</span>
    </header>

    <main class="page__main">
      <section class="theme-block">
        <h2>links</h2>
        <article class="type-block">
          <h3>themes</h3>
          <div class="row row--links">
            <FuLink
              theme="primary"
              :destination="'/'"
            >
              Primary link
            </FuLink>
            <FuLink
              theme="secondary"
              :destination="'/guard'"
            >
              Secondary link
            </FuLink>
            <FuLink
              theme="tertiary"
              :destination="'/expert'"
            >
              Tertiary link
            </FuLink>
            <FuLink
              theme="tertiary"
              selected
              :destination="'/'"
            >
              Tertiary selected
            </FuLink>
            <FuLink
              theme="primary"
              external
              destination="https://example.com"
            >
              External
            </FuLink>
          </div>
        </article>
      </section>

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

      <section class="theme-block">
        <h2>icon slots</h2>

        <article class="type-block">
          <h3>by name</h3>
          <div class="row">
            <FuButton prepend-icon-name="plus"> Default set</FuButton>
            <FuButton
              append-icon-name="chevron-down"
              append-icon-type="arrows"
            >
              Named set
            </FuButton>
            <FuButton
              prepend-icon-name="colors"
              prepend-icon-type="editor"
              append-icon-name="arrow-right"
              append-icon-type="arrows"
            >
              Both slots
            </FuButton>
            <FuButton
              icon-only
              prepend-icon-name="settings-01"
              aria-label="Settings"
            />
          </div>
        </article>

        <article class="type-block">
          <h3>size-derived floor</h3>
          <div class="row">
            <FuButton
              v-for="size in sizes"
              :key="`icon-size-${size}`"
              :size="size"
              prepend-icon-name="zap"
              append-icon-name="chevron-down"
              append-icon-type="arrows"
            >
              {{ size }}
            </FuButton>
          </div>
        </article>

        <article class="type-block">
          <h3>color override</h3>
          <div class="row">
            <FuButton
              theme="secondary"
              prepend-icon-name="zap"
              prepend-icon-color="var(--fu-accent, #f59e0b)"
            >
              Inline color
            </FuButton>
            <FuButton
              theme="secondary"
              prepend-icon-name="zap"
            >
              Inherited color
            </FuButton>
          </div>
        </article>

        <article class="type-block">
          <h3>component wins over name</h3>
          <div class="row">
            <FuButton
              :prepend-icon="CustomDotIcon"
              prepend-icon-name="plus"
            >
              Component slot
            </FuButton>
            <FuButton prepend-icon-name="plus"> Name slot</FuButton>
          </div>
        </article>

        <article class="type-block">
          <h3>links</h3>
          <div class="row row--links">
            <FuLink
              theme="primary"
              :destination="'/'"
              prepend-icon-name="home-01"
            >
              Named icon
            </FuLink>
            <FuLink
              theme="secondary"
              :destination="'/guard'"
              append-icon-name="arrow-right"
              append-icon-type="arrows"
              append-icon-color="var(--fu-accent, #f59e0b)"
            >
              Colored icon
            </FuLink>
          </div>
        </article>
      </section>

      <section
        v-for="theme in themes"
        :key="theme"
        class="theme-block"
      >
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
                :class="state === 'disabled' ? undefined : `preview-state--${state}`"
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
import { h } from "vue";
import type { IButtonProps } from "../../src/runtime/components/Button.vue";
import type { IBadgeProps, TBadgeTheme } from "../../src/runtime/components/Badge.vue";
import type { FuMode } from "../../src/runtime/types";

const props = defineProps<{
  mode: FuMode;
  title: string;
}>();

const { setMode } = useFuturristic();

const themes: NonNullable<IButtonProps["theme"]>[] = ["primary", "secondary"];
const types: NonNullable<IButtonProps["type"]>[] = ["main", "subtle", "subtle-border", "subtle-lift"];
const sizes: NonNullable<IButtonProps["size"]>[] = ["sm", "md", "lg", "xl"];
const states = ["default", "hover", "active", "disabled"] as const;
const badgeThemes: NonNullable<IBadgeProps["theme"]>[] = ["success", "misc", "danger", "warning", "neutral"];
/** Stand-in for "any component a consumer passes" — proves component beats name. */
const CustomDotIcon = () =>
  h("svg", { width: 16, height: 16, viewBox: "0 0 16 16", "aria-hidden": "true" }, [
    h("circle", { cx: 8, cy: 8, r: 5, fill: "currentColor" }),
  ]);

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

.row--links {
  align-items: stretch;
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
  box-shadow: var(--fu-button-shadow-active, var(--fu-button-shadow-hover, var(--fu-button-shadow, none)));
}
</style>

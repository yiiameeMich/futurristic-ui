<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IIconProps } from '../../src/runtime/types/icon'

interface IconEntry {
  set: string
  name: string
}

const modules = import.meta.glob('../../src/runtime/assets/icons/*/*.svg')

const allIcons = Object.keys(modules)
  .map((path) => {
    const match = path.match(/icons\/([^/]+)\/([^/]+)\.svg$/)
    return match ? { set: match[1], name: match[2] } : null
  })
  .filter((entry): entry is IconEntry => entry !== null)
  .sort((a, b) => a.set.localeCompare(b.set) || a.name.localeCompare(b.name))

const sets = [...new Set(allIcons.map(icon => icon.set))].sort()

const query = ref('')
const swatches = ['#101828', '#7f56d9', '#12b76a', '#f04438', '#ffffff']
const color = ref(swatches[0])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return allIcons
  return allIcons.filter(icon => icon.name.includes(q) || icon.set.includes(q))
})

const grouped = computed(() => {
  const bySet = new Map<string, IconEntry[]>()
  for (const icon of filtered.value) {
    if (!bySet.has(icon.set)) bySet.set(icon.set, [])
    bySet.get(icon.set)!.push(icon)
  }
  return [...bySet.entries()]
})

function iconProps(icon: IconEntry): IIconProps {
  return { iconType: icon.set, iconName: icon.name } as IIconProps
}
</script>

<template>
  <div
    class="icons-page"
    :style="{ color }"
  >
    <header class="icons-toolbar">
      <input
        v-model="query"
        type="search"
        placeholder="Filter by name or set…"
        class="icons-search"
      >
      <div class="icons-swatches">
        <button
          v-for="swatch in swatches"
          :key="swatch"
          type="button"
          class="icons-swatch"
          :class="{ 'icons-swatch--active': swatch === color }"
          :style="{ backgroundColor: swatch }"
          :aria-label="`Use color ${swatch}`"
          @click="color = swatch"
        />
      </div>
      <span class="icons-count">{{ filtered.length }} / {{ allIcons.length }} icons · {{ sets.length }} sets</span>
    </header>

    <section
      v-for="[set, icons] in grouped"
      :key="set"
      class="icons-section"
    >
      <h2 class="icons-section-title">
        {{ set }} <span class="icons-section-count">({{ icons.length }})</span>
      </h2>
      <div class="icons-grid">
        <div
          v-for="icon in icons"
          :key="`${icon.set}/${icon.name}`"
          class="icons-cell"
        >
          <FuIcon
            v-bind="iconProps(icon)"
            class="icons-glyph"
          />
          <span class="icons-label">{{ icon.name }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.icons-page {
  padding: 1.5rem;
}

.icons-toolbar {
  position: sticky;
  top: 3rem;
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  margin-bottom: 1rem;
  background-color: var(--fu-surface);
}

.icons-search {
  flex: 1 1 240px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--fu-border);
  border-radius: var(--fu-radius-tab);
  background-color: var(--fu-surface-raised);
  color: var(--fu-on-surface);
}

.icons-swatches {
  display: flex;
  gap: 0.375rem;
}

.icons-swatch {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 2px solid var(--fu-border);
  cursor: pointer;
  padding: 0;
}

.icons-swatch--active {
  outline: 2px solid var(--fu-primary);
  outline-offset: 2px;
}

.icons-count {
  font-size: 0.8125rem;
  color: var(--fu-secondary);
  white-space: nowrap;
}

.icons-section {
  margin-bottom: 2rem;
}

.icons-section-title {
  font-size: 1rem;
  text-transform: capitalize;
  margin-bottom: 0.75rem;
}

.icons-section-count {
  font-weight: 400;
  color: var(--fu-secondary);
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 0.75rem;
}

.icons-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--fu-border);
  border-radius: var(--fu-radius-tab);
  background-color: var(--fu-surface-raised);
}

.icons-glyph {
  width: 24px;
  height: 24px;
}

.icons-label {
  font-size: 0.6875rem;
  text-align: center;
  word-break: break-word;
  color: var(--fu-on-surface);
}
</style>

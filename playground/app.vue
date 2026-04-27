<template>
  <div>
    <nav class="playground-nav">
      <NuxtLink to="/">Defend</NuxtLink>
      <NuxtLink to="/guard">Guard</NuxtLink>
      <NuxtLink to="/expert">Expert</NuxtLink>
    </nav>
    <NuxtPage />
  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background-color: var(--fu-surface);
  color: var(--fu-on-surface);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.playground-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--fu-border);
  background-color: var(--fu-surface-raised);
}

.playground-nav a {
  text-decoration: none;
  padding: 0.375rem 0.75rem;
  border-radius: var(--fu-radius-tab);
  color: var(--fu-secondary);
  font-weight: 600;
  font-size: 0.875rem;
}

.playground-nav a.router-link-active {
  background: var(--fu-primary);
  color: var(--fu-on-primary);
}
</style>

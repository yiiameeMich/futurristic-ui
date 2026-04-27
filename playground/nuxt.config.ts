export default defineNuxtConfig({
  modules: ['@yiiameemich/futurristic-ui'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',

  futurristic: {
    mode: 'defend',
    prefix: 'Fu',
  },
})

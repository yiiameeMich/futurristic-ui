export default defineNuxtConfig({
  modules: ["@yiiameemich/futurristic-ui"],
  devtools: { enabled: true },
  compatibilityDate: "latest",
  experimental: {
    typedPages: true,
  },

  futurristic: {
    mode: "defend",
    prefix: "Fu",
  },
});

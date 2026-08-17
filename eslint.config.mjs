import {createConfigForNuxt} from "@nuxt/eslint-config/flat";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier";

export default createConfigForNuxt({
  features: {
    typescript: true,
    stylistic: false, // Disable to avoid conflicts with Prettier
  },
}).append([
  eslintConfigPrettier, // Disables ESLint rules that conflict with Prettier
  {
    name: "prettier-integration",
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": ["error"],
    },
  },
  {
    name: "custom-rules",
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-multiple-template-root": "off",
      "vue/no-v-html": "off",

      semi: "off",
      "no-prototype-builtins": "off",
      camelcase: "off",
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-extra-boolean-cast": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "no-restricted-imports": [
        "error",
        {
          patterns: ["~/*"],
        },
      ],
    },
  },
]);

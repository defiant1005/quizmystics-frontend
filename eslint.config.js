import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import pluginVue from "eslint-plugin-vue";
import pluginVitest from "eslint-plugin-vitest";
import vueParser from "vue-eslint-parser";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default [
  js.configs.recommended,
  ...pluginVue.configs["flat/strongly-recommended"],
  {
    files: ["**/*.ts", "**/*.vue"],
    languageOptions: {
      parser: vueParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        parser: tsParser,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
      },
    },
    plugins: {
      ts,
      pluginVue,
      pluginVitest,
      "unused-imports": unusedImports,
    },
    rules: {
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      quotes: [
        "error",
        "double",
        {
          avoidEscape: true,
          allowTemplateLiterals: false,
        },
      ],
      "vue/v-on-event-hyphenation": [
        "error",
        "never",
        {
          autofix: true,
          ignore: [],
        },
      ],
      "vue/block-lang": [
        "error",
        {
          script: {
            lang: "ts",
          },
        },
      ],
      "vue/block-order": [
        "error",
        {
          order: ["script[setup]", "template", "style[scoped]"],
        },
      ],
      "vue/block-tag-newline": [
        "error",
        {
          singleline: "always",
          multiline: "always",
          maxEmptyLines: 1,
        },
      ],
      "vue/singleline-html-element-content-newline": "off",
      "vue/component-api-style": ["error", ["script-setup"]],
      "vue/attributes-order": [
        "error",
        {
          order: [
            "DEFINITION",
            "LIST_RENDERING",
            "CONDITIONALS",
            "RENDER_MODIFIERS",
            "GLOBAL",
            ["UNIQUE", "SLOT"],
            "TWO_WAY_BINDING",
            "OTHER_DIRECTIVES",
            "OTHER_ATTR",
            "EVENTS",
            "CONTENT",
          ],
          alphabetical: false,
        },
      ],
      "vue/component-name-in-template-casing": [
        "error",
        "PascalCase",
        {
          registeredComponentsOnly: false,
          ignores: [],
        },
      ],
      "vue/component-options-name-casing": ["error", "PascalCase"],
      "vue/custom-event-name-casing": [
        "error",
        "camelCase",
        {
          ignores: [],
        },
      ],
      "vue/define-emits-declaration": ["error", "runtime"],
      "vue/define-macros-order": [
        "error",
        {
          order: ["defineProps", "defineEmits"],
        },
      ],
      "vue/define-props-declaration": ["error", "runtime"],
      "vue/html-button-has-type": [
        "error",
        {
          button: true,
          submit: true,
          reset: true,
        },
      ],
      "vue/new-line-between-multi-line-property": [
        "error",
        {
          minLineOfMultilineProperty: 2,
        },
      ],
      "vue/next-tick-style": ["error", "callback"],
      "vue/no-deprecated-model-definition": [
        "error",
        {
          allowVue3Compat: true,
        },
      ],
      "vue/no-required-prop-with-default": [
        "error",
        {
          autofix: true,
        },
      ],
      "vue/no-setup-props-reactivity-loss": ["error"],
      "vue/no-undef-properties": [
        "error",
        {
          ignores: ["/^\\$/"],
        },
      ],
      "vue/no-unused-refs": ["error"],
      "vue/no-use-v-else-with-v-for": ["error"],
      "vue/no-useless-v-bind": [
        "error",
        {
          ignoreIncludesComment: false,
          ignoreStringEscape: false,
        },
      ],
      "vue/padding-line-between-blocks": ["error", "always"],
      "vue/padding-line-between-tags": [
        "error",
        [{ blankLine: "consistent", prev: "*", next: "*" }],
      ],
      "vue/padding-lines-in-component-definition": [
        "error",
        {
          betweenOptions: "always",
          withinOption: "always",
          groupSingleLineProperties: true,
        },
      ],
      "vue/prefer-define-options": ["error"],
      "vue/prefer-separate-static-class": ["error"],
      "vue/require-direct-export": [
        "error",
        {
          disallowFunctionalComponentFunction: false,
        },
      ],
      "vue/require-macro-variable-name": [
        "error",
        {
          defineProps: "props",
          defineEmits: "emit",
          defineSlots: "slots",
          useSlots: "slots",
          useAttrs: "attrs",
        },
      ],
      "vue/require-name-property": ["error"],
      "vue/require-typed-object-prop": ["error"],
      "vue/require-typed-ref": ["error"],
      "vue/v-for-delimiter-style": ["error", "in"],
      "vue/valid-define-options": ["error"],
      curly: ["error", "all"],
      "no-constant-condition": ["warn"],
      "no-unreachable": ["warn"],
      "vue/max-attributes-per-line": "off",
      "vue/html-self-closing": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector: "ClassDeclaration",
          message:
            "Использование классов запрещено. Используйте функции или другие подходы.",
        },
        {
          selector: "ClassExpression",
          message:
            "Использование классов (анонимных или именованных) запрещено.",
        },
      ],
      "vue/no-restricted-syntax": [
        "error",
        {
          selector: 'Identifier[name="$attrs"]',
          message: "Using `$attrs` is restricted in this project.",
        },
      ],
    },
  },
];

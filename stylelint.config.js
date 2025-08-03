/** @type {import('stylelint').Config} */
export default {
  extends: [
    "stylelint-config-standard-scss",
    "stylelint-config-recommended-vue",
    "stylelint-config-recess-order",
  ],
  fix: true,
  plugins: ["stylelint-order"],
  overrides: [
    {
      files: ["**/*.vue"],
      customSyntax: "postcss-html",
    },
    {
      files: ["**/*.scss"],
      customSyntax: "postcss-scss",
    },
    {
      files: ["src/scss/mixin.scss"],
      rules: {
        "no-empty-source": null,
        "block-no-empty": null,
      },
    },
  ],
  rules: {
    "scss/double-slash-comment-whitespace-inside": [
      "always",
      { severity: "warning" },
    ],

    "scss/at-mixin-pattern": null,

    "keyframes-name-pattern": null,

    "no-descending-specificity": null,

    "selector-class-pattern": null,

    "no-empty-source": null,
    "block-no-empty": null,

    "max-nesting-depth": [
      5,
      {
        ignoreAtRules: ["media", "supports"],
      },
    ],

    "value-keyword-case": [
      "lower",
      {
        ignoreFunctions: ["v-bind"],
      },
    ],

    "order/order": [
      "custom-properties",
      "declarations",
      {
        type: "at-rule",
        name: "include",
        hasBlock: false,
      },
    ],

    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "extend",
          "mixin",
          "use",
          "forward",
          "include",
          "if",
          "else",
          "for",
          "each",
          "while",
        ],
      },
    ],
  },
};

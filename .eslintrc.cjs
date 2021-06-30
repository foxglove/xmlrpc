module.exports = {
  extends: ["plugin:@foxglove/base", "plugin:@foxglove/jest"],
  env: {
    node: true,
  },
  ignorePatterns: ["dist"],
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      extends: ["plugin:@foxglove/typescript"],
      parserOptions: {
        project: "tsconfig.json",
      },
      rules: {
        // these rules should be fixed and removed from this list
        "@typescript-eslint/no-floating-promises": "warn",
        "@typescript-eslint/no-misused-promises": "warn",
        "@typescript-eslint/no-unsafe-call": "warn",
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-unsafe-return": "warn",
        "@typescript-eslint/require-await": "warn",
        "@typescript-eslint/restrict-template-expressions": "warn",
        "jest/no-done-callback": "warn",
      },
    },
  ],
};

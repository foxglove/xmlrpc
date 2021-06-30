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
    },
  ],
};

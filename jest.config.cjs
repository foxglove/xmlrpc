module.exports = {
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  transform: {
    "\\.ts$": "esbuild-jest",
  },
  resolver: "jest-ts-webcompat-resolver",
};

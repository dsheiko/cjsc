"use strict";

module.exports = {
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/tests/**/*.test.js"
  ],
  collectCoverageFrom: [
    "lib/**/*.js",
    "cjsc-module.js",
    "!lib/Renderer/template/**"
  ],
  coverageReporters: [ "text", "lcov" ],
  verbose: true
};

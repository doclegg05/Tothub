/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "./base.js",
    "next/core-web-vitals",
    "next/typescript"
  ],
  env: {
    browser: true,
    node: true
  },
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "react/no-unescaped-entities": "error"
  }
};

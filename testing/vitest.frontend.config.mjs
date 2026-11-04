import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import webConfig from "../web/vite.config.js";
const fromWeb = createRequire(
  new URL("../web/package.json", import.meta.url)
);
export default {
  ...webConfig,
  root: fileURLToPath(new URL("../web/", import.meta.url)),
  resolve: {
    ...webConfig.resolve,
    alias: {
      ...webConfig.resolve?.alias,
      "@testing-library/react":
        fromWeb.resolve("@testing-library/react"),
      "@testing-library/jest-dom/vitest":
        fromWeb.resolve("@testing-library/jest-dom/vitest"),
    },
    modules: [
      fileURLToPath(new URL("../web/node_modules/", import.meta.url)),
      "node_modules",
    ],
  },
  test: {
    ...webConfig.test,
    include: ["../testing/frontend/**/*.test.jsx"],
    environment: "jsdom",
    globals: true,
  },
};

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
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
      "@testing-library/jest-dom": fromWeb.resolve(
        "@testing-library/jest-dom"
      ),
    },
  },
  test: {
    ...webConfig.test,
    include: ["../testing/frontend/**/*.test.jsx"],
  },
};

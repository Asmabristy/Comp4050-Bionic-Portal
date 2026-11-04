import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import webConfig from "../web/vite.config.js";
const fromWeb = createRequire(
  new URL("../web/package.json", import.meta.url)
);
export default {
  ...webConfig,
  root: fileURLToPath(new URL("../web/", import.meta.url)),
  resolve: {
    alias: {
      "@testing-library/jest-dom/vitest": fromWeb.resolve(
        "@testing-library/jest-dom/vitest"
      ),
      "@testing-library/react": fromWeb.resolve(
        "@testing-library/react"
      ),
      vitest: fileURLToPath(new URL("./dist/index.js", pathToFileURL(fromWeb.resolve("vitest/package.json")))),
    },
  },
  test: {
    ...webConfig.test,
    include: ["../testing/frontend/**/*.test.jsx"],
  },
};

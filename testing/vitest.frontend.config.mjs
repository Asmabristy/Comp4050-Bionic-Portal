import { fileURLToPath } from "node:url";
import webConfig from "../web/vite.config.js";
const webNodeModules = fileURLToPath(new URL("../web/node_modules/", import.meta.url));
export default {
  ...webConfig,
  root: fileURLToPath(new URL("../web/", import.meta.url)),
  resolve: {
    ...webConfig.resolve,
    alias: [
      {
        find: /^@testing-library\/jest-dom\/vitest$/,
        replacement: `${webNodeModules}@testing-library/jest-dom/dist/vitest.mjs`,
      },
      {
        find: /^@testing-library\/react$/,
        replacement: `${webNodeModules}@testing-library/react/dist/index.js`,
      },
    ],
  },
  test: {
    ...webConfig.test,
    include: ["../testing/frontend/**/*.test.jsx"],
  },
};
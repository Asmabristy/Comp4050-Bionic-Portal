import { fileURLToPath } from "node:url";
import webConfig from "../web/vite.config.js";
export default {
  ...webConfig,
  root: fileURLToPath(new URL("../web/", import.meta.url)),
  resolve: {
    ...webConfig.resolve,
    alias: webConfig.resolve?.alias ?? {},
  },
  test: {
    ...webConfig.test,
    include: ["../testing/frontend/**/*.test.jsx"],
  },
};
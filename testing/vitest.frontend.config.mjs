import { fileURLToPath } from "node:url";
import webConfig from "../web/vite.config.js";
export default {
  ...webConfig,
  root: fileURLToPath(new URL("../web/", import.meta.url)),
  test: {
    ...webConfig.test,
    include: ["../testing/frontend/**/*.test.jsx"],
  },
};

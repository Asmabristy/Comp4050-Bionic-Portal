import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
const fromServer = createRequire(new URL("../server/package.json", import.meta.url));
export default {
  root: fileURLToPath(new URL("../server/", import.meta.url)),
  resolve: { alias: {
    express: fromServer.resolve("express"),
    vitest: fileURLToPath(new URL("./dist/index.js", pathToFileURL(fromServer.resolve("vitest/package.json")))),
  } },
  test: {
    environment: "node",
    include: ["../testing/backend/**/*.test.js"],
    clearMocks: true,
  },
};

import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
   test: {
      environment: "happy-dom",
      globals: true,
      setupFiles: ["./vitest.setup.ts"],
      include: ["src/**/*.spec.ts", "src/**/*.spec.tsx"],
   },
   resolve: {
      alias: {
         "@": path.resolve(__dirname, "./src"),
      },
   },
});

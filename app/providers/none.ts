import { defineProvider } from "@nuxt/image/runtime";
import { resolveContentFile } from "../utils/mediaUrl";

export default defineProvider({
  getImage(src, _options, ctx) {
    // Calling useRuntimeConfig() here imports the Vue app into Nitro.
    // The image runtime already stored the full runtime config.
    const runtime = ctx.options.runtimeConfig as {
      app?: { baseURL?: string };
      public?: { apiBase?: string };
    };
    const siteBase = runtime.app?.baseURL ?? "/";
    const apiBase = runtime.public?.apiBase ?? "";
    return { url: resolveContentFile(src, { apiBase, siteBase }) ?? src };
  },
});

import { defineProvider } from "@nuxt/image/runtime";
import { withBase } from "../utils/withBase";

export default defineProvider({
  getImage(src, _options, ctx) {
    // Calling useRuntimeConfig() here imports the Vue app into Nitro.
    // The image runtime already stored useRuntimeConfig().app.baseURL.
    return { url: withBase(ctx.options.runtimeConfig.app.baseURL, src) };
  },
});

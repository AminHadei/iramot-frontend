import { defineProvider } from "@nuxt/image/runtime";

export default defineProvider({
  getImage(src: string) {
    return { url: src };
  },
});

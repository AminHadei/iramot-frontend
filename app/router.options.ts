import type { RouterConfig } from "@nuxt/schema";
import { aboutHashId } from "~/utils/aboutHash";

function scrollToHash(hash: string) {
  const id = aboutHashId(hash);
  if (!id) return { top: 0 } as const;
  return new Promise<{ el: string; top: number; behavior: "smooth" }>((resolve) => {
    const ready = (left: number) => {
      if (document.getElementById(id) || left <= 0) {
        resolve({ el: `#${id}`, top: 110, behavior: "smooth" });
        return;
      }
      requestAnimationFrame(() => ready(left - 1));
    };
    ready(30);
  });
}

export default <RouterConfig>{
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) return scrollToHash(to.hash);
    if (savedPosition) return savedPosition;
    return { top: 0 };
  },
};

export function useSite() {
  return useAsyncData("site", () => queryCollection("site").first());
}

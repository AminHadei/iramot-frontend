function loadHomeChrome() {
  return queryCollection("home").first();
}

export function useHomeChrome() {
  return useAsyncData("home-chrome", loadHomeChrome);
}

export function useAccordionPanel(initiallyOpen = false) {
  const isOpen = ref(initiallyOpen);
  const reveal = ref<HTMLElement | null>(null);
  const maxHeight = ref(initiallyOpen ? "9999px" : "0px");
  let observer: ResizeObserver | undefined;

  function applyHeight() {
    const el = reveal.value;
    if (!el) return;
    const next = isOpen.value ? `${el.scrollHeight}px` : "0px";
    if (maxHeight.value !== next) maxHeight.value = next;
  }

  function toggle() {
    isOpen.value = !isOpen.value;
    void nextTick(applyHeight);
  }

  onMounted(() => {
    applyHeight();
    const el = reveal.value;
    if (!el || typeof ResizeObserver === "undefined") return;
    observer = new ResizeObserver(() => {
      if (isOpen.value) applyHeight();
    });
    observer.observe(el);
  });

  onBeforeUnmount(() => {
    observer?.disconnect();
  });

  return { isOpen, reveal, maxHeight, toggle };
}

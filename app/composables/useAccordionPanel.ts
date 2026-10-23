export function useAccordionPanel(initiallyOpen = false) {
  const isOpen = ref(initiallyOpen);
  const reveal = ref<HTMLElement | null>(null);
  const maxHeight = ref(initiallyOpen ? "9999px" : "0px");
  let observer: ResizeObserver | undefined;

  function applyHeight() {
    const el = reveal.value;
    if (!el) return;
    if (!isOpen.value) {
      if (maxHeight.value !== "0px") maxHeight.value = "0px";
      return;
    }
    const styles = getComputedStyle(el);
    const border =
      (Number.parseFloat(styles.borderTopWidth) || 0) +
      (Number.parseFloat(styles.borderBottomWidth) || 0);
    const next = `${Math.ceil(el.scrollHeight + border)}px`;
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

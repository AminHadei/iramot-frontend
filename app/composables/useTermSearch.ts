import { computed, onMounted, onScopeDispose, ref, toValue, watch } from "vue";
import type { ComputedRef, MaybeRefOrGetter, Ref } from "vue";
import { searchTerms } from "~/utils/persianSearch";
import type { SearchableTerm, TermHit } from "~/utils/persianSearch";

export const TERM_SEARCH_DEBOUNCE_MS = 280;

export function useTermSearch<T extends SearchableTerm>(
  terms: MaybeRefOrGetter<readonly T[]>,
  opts?: { debounceMs?: number; batch?: number },
): {
  input: Ref<string>;
  query: Ref<string>;
  source: Ref<number | null>;
  pending: Ref<boolean>;
  hits: ComputedRef<TermHit<T>[]>;
  visible: ComputedRef<TermHit<T>[]>;
  total: ComputedRef<number>;
  hasMore: ComputedRef<boolean>;
  loadMore: () => void;
  clear: () => void;
  flush: () => void;
  statusKey: ComputedRef<"default" | "results" | "empty">;
} {
  const debounceMs = opts?.debounceMs ?? TERM_SEARCH_DEBOUNCE_MS;
  const batch = opts?.batch ?? 30;
  const input = ref("");
  const query = ref("");
  const source = ref<number | null>(null);
  const shown = ref(batch);
  const pending = computed(() => input.value.trim() !== query.value);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let listen = false;

  const hits = computed(() =>
    searchTerms(toValue(terms), query.value, { source: source.value }),
  );
  const total = computed(() => hits.value.length);
  const visible = computed(() => hits.value.slice(0, shown.value));
  const hasMore = computed(() => shown.value < total.value);
  const statusKey = computed<"default" | "results" | "empty">(() => {
    if (!query.value) return "default";
    return total.value > 0 ? "results" : "empty";
  });

  function note() {
    if (!import.meta.dev || !import.meta.client) return;
    const host = window as Window & { __termFilterCalls?: number };
    host.__termFilterCalls = (host.__termFilterCalls ?? 0) + 1;
  }

  function commit(track: boolean) {
    if (timer) clearTimeout(timer);
    timer = undefined;
    const next = input.value.trim();
    const changed = next !== query.value;
    if (changed) query.value = next;
    if (track && changed) note();
  }

  function flush() {
    commit(true);
  }

  function clear() {
    input.value = "";
    commit(true);
  }

  function loadMore() {
    shown.value = Math.min(shown.value + batch, total.value);
  }

  function readUrl() {
    const params = new URLSearchParams(window.location.search);
    input.value = params.get("q") ?? "";
    const src = params.get("src");
    source.value = src && /^\d+$/.test(src) ? Number(src) : null;
    commit(false);
  }

  function syncUrl() {
    const url = new URL(window.location.href);
    if (query.value) url.searchParams.set("q", query.value);
    else url.searchParams.delete("q");
    if (source.value != null) url.searchParams.set("src", String(source.value));
    else url.searchParams.delete("src");
    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) window.history.replaceState(window.history.state, "", next);
  }

  watch(input, () => {
    if (!listen) return;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => commit(true), debounceMs);
  });

  watch([query, source], () => {
    shown.value = batch;
    if (listen) syncUrl();
  });

  watch(source, () => {
    if (listen) note();
  });

  function onPop() {
    const was = listen;
    listen = false;
    readUrl();
    listen = was;
  }

  onMounted(() => {
    readUrl();
    listen = true;
    window.addEventListener("popstate", onPop);
  });

  onScopeDispose(() => {
    if (timer) clearTimeout(timer);
    if (import.meta.client) window.removeEventListener("popstate", onPop);
  });

  return {
    input,
    query,
    source,
    pending,
    hits,
    visible,
    total,
    hasMore,
    loadMore,
    clear,
    flush,
    statusKey,
  };
}

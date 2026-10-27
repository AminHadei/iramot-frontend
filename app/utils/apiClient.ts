import { ApiRequestError } from "~/utils/apiError";

export interface TokenStore {
  getAccess(): string | null;
  setAccess(token: string | null): void;
  getRefresh(): string | null;
  setRefresh(token: string | null): void;
  clear(): void;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string | null;
}

export interface ApiQuery {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ApiRequest {
  method?: string;
  query?: ApiQuery;
  body?: unknown;
  auth?: boolean;
  headers?: HeadersInit;
  raw?: boolean;
}

export interface ApiClientOptions {
  baseUrl: string;
  store: TokenStore;
  fetchImpl?: typeof fetch;
  onAuthLost?: () => void;
}

export interface ApiClient {
  request<T>(path: string, init?: ApiRequest): Promise<T>;
  refresh(): Promise<boolean>;
  setSession(tokens: TokenPair): void;
  clearSession(): void;
  readonly store: TokenStore;
}

const refreshPath = "/auth/refresh";

export function createMemoryTokenStore(): TokenStore {
  let access: string | null = null;
  let refresh: string | null = null;
  return {
    getAccess: () => access,
    setAccess(token) {
      access = token;
    },
    getRefresh: () => refresh,
    setRefresh(token) {
      refresh = token;
    },
    clear() {
      access = null;
      refresh = null;
    },
  };
}

const refreshStorageKey = "irmot.refreshToken";

export function createBrowserTokenStore(): TokenStore {
  let access: string | null = null;
  const storage = () => (typeof sessionStorage === "undefined" ? null : sessionStorage);
  return {
    getAccess: () => access,
    setAccess(token) {
      access = token;
    },
    getRefresh() {
      try {
        return storage()?.getItem(refreshStorageKey) ?? null;
      } catch {
        return null;
      }
    },
    setRefresh(token) {
      try {
        const bin = storage();
        if (!bin) return;
        if (token) bin.setItem(refreshStorageKey, token);
        else bin.removeItem(refreshStorageKey);
      } catch {
        // Private mode can reject storage. The session then ends on reload.
      }
    },
    clear() {
      access = null;
      this.setRefresh(null);
    },
  };
}

export function readTokens(body: unknown): TokenPair | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const nested =
    record.tokens && typeof record.tokens === "object"
      ? (record.tokens as Record<string, unknown>)
      : record;
  const access = nested.accessToken ?? nested.access_token;
  if (typeof access !== "string" || !access) return null;
  const refresh = nested.refreshToken ?? nested.refresh_token;
  return {
    accessToken: access,
    refreshToken: typeof refresh === "string" && refresh ? refresh : null,
  };
}

function buildUrl(baseUrl: string, path: string, query?: ApiQuery): string {
  const root = baseUrl.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${root}${suffix}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  const fetchImpl = options.fetchImpl ?? fetch;
  const store = options.store;
  let refreshing: Promise<boolean> | null = null;

  function setSession(tokens: TokenPair) {
    store.setAccess(tokens.accessToken);
    if (tokens.refreshToken) store.setRefresh(tokens.refreshToken);
  }

  function clearSession() {
    store.clear();
  }

  async function refresh(): Promise<boolean> {
    if (refreshing) return refreshing;
    refreshing = doRefresh().finally(() => {
      refreshing = null;
    });
    return refreshing;
  }

  async function doRefresh(): Promise<boolean> {
    const refreshToken = store.getRefresh();
    if (!refreshToken || !options.baseUrl) return false;
    let response: Response;
    try {
      response = await fetchImpl(buildUrl(options.baseUrl, refreshPath), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      return false;
    }
    if (!response.ok) return false;
    const tokens = readTokens(await parseBody(response));
    if (!tokens) return false;
    setSession(tokens);
    return true;
  }

  async function request<T>(
    path: string,
    init: ApiRequest = {},
    retried = false,
  ): Promise<T> {
    if (!options.baseUrl) {
      throw new ApiRequestError(0, null);
    }
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    const useAuth = init.auth !== false && !path.startsWith(refreshPath);
    if (useAuth) {
      const access = store.getAccess();
      if (access) headers.set("Authorization", `Bearer ${access}`);
    }
    let body: BodyInit | undefined;
    if (init.body instanceof FormData) {
      body = init.body;
    } else if (init.body !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(init.body);
    }
    const response = await fetchImpl(buildUrl(options.baseUrl, path, init.query), {
      method: init.method ?? (init.body === undefined ? "GET" : "POST"),
      headers,
      body,
    });
    if (response.status === 401 && useAuth && !retried) {
      const ok = await refresh();
      if (ok) return request<T>(path, init, true);
      clearSession();
      options.onAuthLost?.();
      throw new ApiRequestError(401, await parseBody(response));
    }
    if (init.raw) {
      if (!response.ok)
        throw new ApiRequestError(response.status, await parseBody(response));
      return (await response.blob()) as T;
    }
    const payload = await parseBody(response);
    if (!response.ok) throw new ApiRequestError(response.status, payload);
    return payload as T;
  }

  return { request, refresh, setSession, clearSession, store };
}

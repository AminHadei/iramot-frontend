import type { ApiClient } from "~/utils/apiClient";
import { readTokens } from "~/utils/apiClient";
import { ApiRequestError } from "~/utils/apiError";
import { readUser } from "~/utils/authUser";
import type { AuthUser, LoginInput, RegisterInput } from "~/types/membership";

export interface AuthController {
  user(): AuthUser | null;
  login(input: LoginInput): Promise<AuthUser>;
  register(
    input: RegisterInput,
  ): Promise<{ user: AuthUser | null; authenticated: boolean }>;
  logout(): Promise<void>;
  restore(): Promise<AuthUser | null>;
  updateProfile(
    patch: Partial<Pick<AuthUser, "email" | "nationalCode">>,
  ): Promise<AuthUser>;
}

export function createAuthController(client: ApiClient): AuthController {
  let current: AuthUser | null = null;

  async function adopt(body: unknown, required: boolean): Promise<AuthUser | null> {
    const tokens = readTokens(body);
    if (tokens) client.setSession(tokens);
    const inline = readUser(body);
    if (inline) {
      current = inline;
      return inline;
    }
    if (!tokens) {
      if (required) throw new ApiRequestError(500, body);
      current = null;
      return null;
    }
    current = await client.request<AuthUser>("/users/me");
    const user = readUser(current) ?? current;
    current = user;
    return user;
  }

  return {
    user: () => current,
    async login(input) {
      const body = await client.request<unknown>("/auth/login", {
        method: "POST",
        auth: false,
        body: input,
      });
      const user = await adopt(body, true);
      if (!user) throw new ApiRequestError(500, body);
      return user;
    },
    async register(input) {
      const body = await client.request<unknown>("/auth/register", {
        method: "POST",
        auth: false,
        body: input,
      });
      const tokens = readTokens(body);
      const user = await adopt(body, false);
      return { user, authenticated: Boolean(tokens && user) };
    },
    async logout() {
      const refreshToken = client.store.getRefresh();
      try {
        if (refreshToken) {
          await client.request("/auth/logout", {
            method: "POST",
            body: { refreshToken },
          });
        }
      } catch {
        // Local logout still proceeds when the server is unreachable.
      }
      client.clearSession();
      current = null;
    },
    async restore() {
      if (current && client.store.getAccess()) return current;
      if (!client.store.getRefresh()) {
        current = null;
        return null;
      }
      const ok = await client.refresh();
      if (!ok) {
        client.clearSession();
        current = null;
        return null;
      }
      try {
        const body = await client.request<unknown>("/users/me");
        current = readUser(body) ?? (body as AuthUser);
        return current;
      } catch {
        client.clearSession();
        current = null;
        return null;
      }
    },
    async updateProfile(patch) {
      const body = await client.request<unknown>("/users/me", {
        method: "PUT",
        body: patch,
      });
      current = readUser(body) ?? { ...(current as AuthUser), ...patch };
      return current;
    },
  };
}

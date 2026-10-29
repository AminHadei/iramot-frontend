import {
  createApiClient,
  createBrowserTokenStore,
  type ApiClient,
} from "~/utils/apiClient";
import { createAuthController, type AuthController } from "~/utils/authController";
import type { AuthUser } from "~/types/membership";

let client: ApiClient | null = null;
let controller: AuthController | null = null;
let restoreTask: Promise<AuthUser | null> | null = null;
let restored = false;

export function useAuth() {
  const config = useRuntimeConfig();
  const user = useState<AuthUser | null>("auth-user", () => null);
  const enabled = computed(() => Boolean(config.public.apiBase));

  function session(): AuthController {
    if (!controller || !client) {
      client = createApiClient({
        baseUrl: config.public.apiBase,
        store: createBrowserTokenStore(),
        onAuthLost() {
          user.value = null;
          restored = true;
        },
      });
      controller = createAuthController(client);
    }
    return controller;
  }

  function api(): ApiClient {
    session();
    return client as ApiClient;
  }

  async function restore() {
    if (!enabled.value) return null;
    if (restored) return user.value;
    if (!restoreTask) {
      restoreTask = session()
        .restore()
        .then((next) => {
          user.value = next;
          restored = true;
          return next;
        })
        .finally(() => {
          restoreTask = null;
        });
    }
    return restoreTask;
  }

  async function login(input: { mobile: string; password: string }) {
    const next = await session().login(input);
    user.value = next;
    restored = true;
    return next;
  }

  async function register(input: {
    firstName: string;
    lastName: string;
    mobile: string;
    password: string;
  }) {
    const result = await session().register(input);
    user.value = result.authenticated ? result.user : null;
    restored = true;
    return result;
  }

  async function logout() {
    await session().logout();
    user.value = null;
    restored = true;
  }

  async function updateProfile(
    patch: Partial<Pick<AuthUser, "firstName" | "lastName" | "email">>,
  ) {
    const next = await session().updateProfile(patch);
    user.value = next;
    return next;
  }

  return {
    user,
    enabled,
    restore,
    login,
    register,
    logout,
    updateProfile,
    api,
  };
}

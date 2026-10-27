import assert from "node:assert/strict";
import {
  createApiClient,
  createMemoryTokenStore,
  readTokens,
} from "../app/utils/apiClient";
import { applyFieldErrors, errorsByField } from "../app/utils/apiError";
import { createAuthController } from "../app/utils/authController";
import { readUser } from "../app/utils/authUser";
import { resolveContentApiBase } from "../app/utils/contentSource";
import {
  composeIsoDateTime,
  formatJalaliField,
  isoToJalali,
  jalaliToIso,
  parseMemberDate,
} from "../app/utils/jalali";
import { resolveContentFile } from "../app/utils/mediaUrl";
import { asPage } from "../app/utils/pageResult";
import {
  englishDigits,
  isCompanyNationalId,
  isIranMobile,
  isNationalCode,
  normalizeIranMobile,
  passwordCode,
  safeNextPath,
} from "../app/utils/validators";

const tokens = {
  accessToken: "access-1",
  refreshToken: "refresh-1",
};

function json(status: number, body: unknown): Response {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function install(
  handler: (
    url: string,
    init: RequestInit | undefined,
    hits: Map<string, number>,
  ) => Response,
) {
  const hits = new Map<string, number>();
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = String(input);
    const path = new URL(url).pathname;
    hits.set(path, (hits.get(path) ?? 0) + 1);
    return handler(url, init, hits);
  };
  const store = createMemoryTokenStore();
  let lost = 0;
  const client = createApiClient({
    baseUrl: "https://api.example.test",
    store,
    fetchImpl,
    onAuthLost() {
      lost += 1;
    },
  });
  return { client, store, hits, lost: () => lost };
}

let unlocked = false;
const parallel = install((url) => {
  const path = new URL(url).pathname;
  if (path === "/auth/refresh") {
    unlocked = true;
    return json(200, { accessToken: "access-2", refreshToken: "refresh-2" });
  }
  if (!unlocked) return json(401, { message: "expired" });
  return json(200, { ok: true });
});
parallel.store.setRefresh("refresh-1");
const [first, second] = await Promise.all([
  parallel.client.request<{ ok: boolean }>("/items"),
  parallel.client.request<{ ok: boolean }>("/items"),
]);
assert.equal(first.ok, true);
assert.equal(second.ok, true);
assert.equal(parallel.hits.get("/auth/refresh"), 1);
assert.equal(parallel.store.getAccess(), "access-2");
assert.equal(parallel.store.getRefresh(), "refresh-2");
assert.equal(parallel.lost(), 0);

const failed = install((url) => {
  const path = new URL(url).pathname;
  if (path === "/auth/refresh") return json(401, { message: "nope" });
  return json(401, { message: "expired" });
});
failed.store.setRefresh("refresh-1");
await assert.rejects(() => failed.client.request("/items"));
assert.equal(failed.hits.get("/auth/refresh"), 1);
assert.equal(failed.store.getAccess(), null);
assert.equal(failed.store.getRefresh(), null);
assert.equal(failed.lost(), 1);

const login = install((url) => {
  if (new URL(url).pathname === "/auth/login") return json(401, { message: "bad" });
  return json(500, {});
});
await assert.rejects(() =>
  login.client.request("/auth/login", {
    method: "POST",
    auth: false,
    body: { mobile: "09120000000", password: "secret1" },
  }),
);
assert.equal(login.hits.get("/auth/refresh"), undefined);

let logoutInit: RequestInit | undefined;
let profileBody: Record<string, unknown> = {};
const session = install((url, init) => {
  const path = new URL(url).pathname;
  if (path === "/auth/login") {
    return json(200, {
      ...tokens,
      user: {
        id: "u1",
        mobile: "09120000000",
        role: "admin",
        firstName: "A",
        lastName: "B",
      },
    });
  }
  if (path === "/users/me" && (init?.method ?? "GET") === "PUT") {
    profileBody = JSON.parse(String(init?.body ?? "{}"));
    return json(200, {
      id: "u1",
      mobile: "09120000000",
      role: "admin",
      firstName: "A",
      lastName: "B",
      email: "a@b.co",
      isActive: true,
    });
  }
  if (path === "/users/me") {
    return json(200, {
      id: "u1",
      mobile: "09120000000",
      role: "admin",
      firstName: "A",
      lastName: "B",
    });
  }
  if (path === "/auth/logout") {
    logoutInit = init;
    return json(204, null);
  }
  if (path === "/auth/refresh")
    return json(200, { accessToken: "access-3", refreshToken: "refresh-3" });
  return json(200, { path, method: init?.method ?? "GET" });
});
const auth = createAuthController(session.client);
const user = await auth.login({ mobile: "09120000000", password: "secret1" });
assert.equal(user.role, "admin");
assert.equal(session.store.getAccess(), "access-1");
const updated = await auth.updateProfile({ email: "a@b.co" });
assert.equal(updated.email, "a@b.co");
assert.equal(profileBody.email, "a@b.co");
assert.equal("firstName" in profileBody, false);
assert.equal("lastName" in profileBody, false);
assert.equal("mobile" in profileBody, false);
await auth.logout();
assert.equal(session.store.getRefresh(), null);
assert.equal(auth.user(), null);
const logoutHeaders = new Headers(logoutInit?.headers);
assert.equal(logoutHeaders.get("authorization"), "Bearer access-1");
assert.equal(JSON.parse(String(logoutInit?.body)).refreshToken, "refresh-1");

const restored = install((url) => {
  const path = new URL(url).pathname;
  if (path === "/auth/refresh") return json(200, tokens);
  if (path === "/users/me") {
    return json(200, {
      id: "u2",
      mobile: "09121111111",
      role: "user",
      firstName: "C",
      lastName: "D",
    });
  }
  return json(404, {});
});
restored.store.setRefresh("refresh-1");
const again = createAuthController(restored.client);
assert.equal((await again.restore())?.id, "u2");
assert.equal(restored.hits.get("/auth/refresh"), 1);

assert.equal(englishDigits("۰۹۱۲۳۴۵۶۷۸۹"), "09123456789");
assert.equal(englishDigits("٠٩١٢"), "0912");
assert.equal(isIranMobile("۰۹۱۲۱۲۳۴۵۶۷"), true);
assert.equal(normalizeIranMobile("+989121234567"), "09121234567");
assert.equal(isIranMobile("0912123456"), false);
assert.equal(isNationalCode("0084572140"), true);
assert.equal(isNationalCode("1111111111"), false);
assert.equal(isNationalCode("0084572141"), false);
assert.equal(isCompanyNationalId("10380214560"), true);
assert.equal(isCompanyNationalId("10380214561"), false);
assert.equal(passwordCode("short1"), "password");
assert.equal(passwordCode("password"), "password");
assert.equal(passwordCode("password1"), null);
assert.equal(safeNextPath("/panel/card"), "/panel/card");
assert.equal(safeNextPath("https://evil.test"), "/panel");
assert.equal(safeNextPath("//evil.test"), "/panel");

assert.equal(formatJalaliField(jalaliToIso(1403, 1, 15) ?? ""), "۱۴۰۳/۰۱/۱۵");
assert.equal(
  formatJalaliField(
    composeIsoDateTime(jalaliToIso(1403, 1, 15) ?? "", 8, 5),
    "datetime",
  ),
  "۱۴۰۳/۰۱/۱۵ ۰۸:۰۵",
);
assert.equal(jalaliToIso(1404, 1, 1), "2025-03-21");
assert.deepEqual(isoToJalali("2025-03-21"), { year: 1404, month: 1, day: 1 });
assert.equal(composeIsoDateTime("2025-03-21", 8, 5), "2025-03-21T08:05:00.000Z");
assert.equal(parseMemberDate("۱۴۰۴/۰۱/۰۱"), "2025-03-21");
assert.equal(parseMemberDate("2025-03-21"), "2025-03-21");
assert.equal(parseMemberDate("not-a-date"), null);

assert.equal(
  resolveContentFile("https://cdn.example.test/uploads/a.png", {
    apiBase: "https://api.example.test/api",
    siteBase: "/irmot/",
  }),
  "https://cdn.example.test/uploads/a.png",
);
assert.equal(
  resolveContentFile("/uploads/a.png", {
    apiBase: "https://api.example.test/api",
    siteBase: "/irmot/",
  }),
  "https://api.example.test/uploads/a.png",
);
assert.equal(
  resolveContentFile("/media/news/a.webp", {
    apiBase: "https://api.example.test",
    siteBase: "/irmot/",
  }),
  "/irmot/media/news/a.webp",
);
assert.equal(
  resolveContentFile("/media/files/card.png", {
    apiBase: "https://api.example.test/api",
    siteBase: "/irmot/",
  }),
  "https://api.example.test/media/files/card.png",
);
assert.equal(
  readUser({
    id: "u3",
    mobile: "09120000000",
    firstName: "A",
    lastName: "B",
    role: "user",
    isActive: false,
  })?.active,
  false,
);

assert.equal(resolveContentApiBase({ publicBase: "", server: true }), "");
assert.equal(
  resolveContentApiBase({ publicBase: "https://api.example.test/", server: false }),
  "https://api.example.test",
);
assert.equal(
  resolveContentApiBase({
    internal: "http://api:3000/",
    publicBase: "https://api.example.test",
    server: true,
  }),
  "http://api:3000",
);
assert.equal(
  resolveContentApiBase({
    internal: "http://api:3000",
    publicBase: "https://api.example.test/",
    server: false,
  }),
  "https://api.example.test",
);
assert.deepEqual(asPage([{ id: 1 }]), {
  items: [{ id: 1 }],
  total: 1,
  page: 1,
  pages: 1,
});
assert.deepEqual(asPage({ users: [{ id: "u" }], total: 4, page: 2, totalPages: 3 }), {
  items: [{ id: "u" }],
  total: 4,
  page: 2,
  pages: 3,
});
assert.equal(asPage({ plans: [{ id: "p" }] }).items.length, 1);
assert.equal(asPage({ applications: [], total: 0, page: 1, totalPages: 0 }).pages, 0);
assert.equal(asPage({ codes: [{ id: "c" }] }).items.length, 1);
assert.equal(asPage({ payments: [{ id: "pay" }] }).items.length, 1);
assert.deepEqual(
  asPage({
    items: [{ id: "new" }],
    users: [{ id: "old" }],
    pages: 2,
    totalPages: 9,
    total: 3,
    page: 1,
  }),
  { items: [{ id: "new" }], total: 3, page: 1, pages: 2 },
);
assert.deepEqual(
  errorsByField(
    {
      message: [
        "firstName must be longer than or equal to 2 characters",
        "nationalCode is invalid",
        "Natural person applications require firstName, lastName, and nationalCode",
      ],
    },
    ["firstName", "lastName", "nationalCode", "email"],
  ).fields.firstName?.includes("firstName"),
  true,
);
assert.equal(
  applyFieldErrors({ message: ["mobile must be a valid Iranian mobile number"] }, {}, [
    "mobile",
    "email",
  ]),
  "",
);
assert.equal(readTokens({ access_token: "a", refresh_token: "b" })?.accessToken, "a");

console.log("membership unit tests passed");

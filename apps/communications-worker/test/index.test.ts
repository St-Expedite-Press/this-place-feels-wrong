import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker, { __testing } from "../src/index";

type TestEnv = {
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
  TO_EMAIL: string;
  TURNSTILE_SECRET?: string;
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_WINDOW_MS?: string;
  UPDATES_IMPORT_TOKEN?: string;
  FOURTH_WALL_API_KEY?: string;
  DB?: unknown;
};

const originalFetch = globalThis.fetch;
const fetchMock = vi.fn<typeof fetch>();

const baseEnv: TestEnv = {
  RESEND_API_KEY: "test-key",
  FROM_EMAIL: "St. Expedite Press <no-reply@stexpedite.press>",
  TO_EMAIL: "editor@stexpedite.press",
  UPDATES_IMPORT_TOKEN: "import-secret",
};

function makeJsonRequest(path: string, body: Record<string, unknown>, headers?: HeadersInit) {
  return new Request(`https://stexpedite.press${path}`, {
    method: "POST",
    headers: {
      origin: "https://stexpedite.press",
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function makeMockDb() {
  const updates = new Map<string, Record<string, unknown>>();
  const rateLimits = new Map<string, { count: number; reset_at: number }>();

  return {
    updates,
    rateLimits,
    prepare(query: string) {
      const sql = query.replace(/\s+/g, " ").trim();
      return {
        bind(...values: unknown[]) {
          return {
            async first<T>() {
              if (sql.includes("FROM updates_signups")) {
                const email = String(values[0] ?? "").toLowerCase();
                for (const [key, value] of updates.entries()) {
                  if (key.toLowerCase() === email) {
                    return { email: value.email } as T;
                  }
                }
                return null;
              }
              if (sql.includes("FROM api_rate_limits")) {
                return (rateLimits.get(String(values[0] ?? "")) ?? null) as T | null;
              }
              return null;
            },
            async run() {
              if (sql.includes("INSERT INTO updates_signups")) {
                const [email, source, userAgent] = values;
                const key = String(email);
                const existing = updates.get(key) ?? { email: key };
                updates.set(key, {
                  ...existing,
                  email: key,
                  source,
                  user_agent: userAgent,
                });
                return {};
              }
              if (sql.includes("UPDATE updates_signups SET")) {
                const email = String(values[values.length - 1] ?? "");
                const existing = updates.get(email) ?? { email };
                updates.set(email, { ...existing, enriched: true });
                return {};
              }
              if (sql.includes("INSERT INTO api_rate_limits")) {
                rateLimits.set(String(values[0] ?? ""), {
                  count: 1,
                  reset_at: Number(values[1] ?? 0),
                });
                return {};
              }
              if (sql.includes("UPDATE api_rate_limits SET count = count + 1")) {
                const key = String(values[0] ?? "");
                const existing = rateLimits.get(key);
                if (existing) rateLimits.set(key, { ...existing, count: existing.count + 1 });
                return {};
              }
              if (sql.includes("DELETE FROM api_rate_limits")) {
                const threshold = Number(values[0] ?? 0);
                for (const [key, value] of rateLimits.entries()) {
                  if (value.reset_at < threshold) rateLimits.delete(key);
                }
                return {};
              }
              return {};
            },
            async all<T>() {
              if (sql.includes("FROM oncoming_projects")) {
                return {
                  results: [
                    {
                      project_slug: "les-fievres-et-les-humeurs",
                      program_key: "master-canon-structure",
                      series_key: "sexp-originals",
                      series_title: "SEXP - Flagship Original Works",
                      cluster_key: null,
                      cluster_title: null,
                      author: "C. Sandbatch",
                      title: "Les Fievres et les humeurs",
                      subtitle: null,
                      publication_year: 2026,
                      status: "published",
                      sort_order: 20,
                      notes: "Keep French title as canonical.",
                      cover_image: "assets/img/les-fievres-cover.svg",
                      popup_description: "A flagship title.",
                      buy_url: null,
                      completion_percent: 100,
                    },
                    {
                      project_slug: "lift-wind-love-heat-symphony-no-1-in-c-minor",
                      program_key: "master-canon-structure",
                      series_key: "sexp-originals",
                      series_title: "SEXP - Flagship Original Works",
                      cluster_key: null,
                      cluster_title: null,
                      author: "C. Sandbatch",
                      title: "Lift Wind / Love Heat: Symphony No. 1 in C Minor",
                      subtitle: null,
                      publication_year: 2025,
                      status: "in_progress",
                      sort_order: 10,
                      notes: "Flagship original work.",
                      cover_image: null,
                      popup_description: "Current book in active editorial work.",
                      buy_url: null,
                      completion_percent: 80,
                    },
                    {
                      project_slug: "lost-southern-lyricists-1890-1915",
                      program_key: "master-canon-structure",
                      series_key: "library-of-the-southern-civilization",
                      series_title: "Library of the Southern Civilization",
                      cluster_key: "anthology",
                      cluster_title: "Anthology Volume",
                      author: "St. Expedite Press (Curated)",
                      title: "Lost Southern Lyricists, 1890-1915",
                      subtitle: "Minor Voices Before the Agrarians",
                      publication_year: 1915,
                      status: "planned",
                      sort_order: 310,
                      notes: "Single curated anthology volume.",
                      cover_image: null,
                      popup_description: "Program placeholder.",
                      buy_url: null,
                      completion_percent: 0,
                    },
                  ] as T[],
                };
              }
              return { results: [] as T[] };
            },
          };
        },
      };
    },
  };
}

beforeEach(() => {
  __testing.clearRateLimitState();
  fetchMock.mockReset();
  globalThis.fetch = fetchMock;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("communications worker", () => {
  it("returns health payload", async () => {
    const req = new Request("https://stexpedite.press/api/health", {
      method: "GET",
      headers: { origin: "https://stexpedite.press" },
    });
    const res = await worker.fetch(req, baseEnv as never);
    const body = (await res.json()) as { ok: boolean; service: string; dbConfigured: boolean };

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.service).toBe("communications-worker");
    expect(body.dbConfigured).toBe(false);
  });

  it("returns storefront catalog payload with cache headers when configured", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          id: "shop_1",
          name: "St. Expedite Press",
          domain: "st-expedite-press-shop",
          publicDomain: "shop.stexpedite.press",
        }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ results: [{ name: "All", slug: "all" }] }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({
          results: [{
            id: "prod_1",
            name: "Test Product",
            slug: "test-product",
            description: "Test",
            images: [{ url: "https://example.com/p.jpg", transformedUrl: "https://example.com/p.jpg" }],
            variants: [{ unitPrice: { value: 24, currency: "USD" } }],
          }],
        }), { status: 200 }),
      );

    const req = new Request("https://stexpedite.press/api/storefront", {
      method: "GET",
      headers: { origin: "https://stexpedite.press" },
    });

    const res = await worker.fetch(req, { ...baseEnv, FOURTH_WALL_API_KEY: "ptkn_test" } as never);
    const body = (await res.json()) as { ok: boolean; products: Array<{ slug: string }> };

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.products[0]?.slug).toBe("test-product");
    expect(res.headers.get("cache-control")).toContain("s-maxage");
  });

  it("returns projects catalog payload with cache headers", async () => {
    const req = new Request("https://stexpedite.press/api/projects", {
      method: "GET",
      headers: { origin: "https://stexpedite.press" },
    });

    const res = await worker.fetch(req, { ...baseEnv, DB: makeMockDb() } as never);
    const body = (await res.json()) as {
      ok: boolean;
      totals: { volumes: number; series: number };
      projects: Array<{
        project_slug: string;
        completion_percent: number;
        cover_image: string | null;
      }>;
    };

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.totals.volumes).toBe(3);
    expect(res.headers.get("cache-control")).toContain("s-maxage");
    expect(body.projects.find((project) => project.project_slug === "les-fievres-et-les-humeurs")?.completion_percent).toBe(100);
    expect(body.projects.find((project) => project.project_slug === "les-fievres-et-les-humeurs")?.cover_image).toBe("assets/img/les-fievres-cover.svg");
    expect(body.projects.find((project) => project.project_slug === "lift-wind-love-heat-symphony-no-1-in-c-minor")?.completion_percent).toBe(80);
    expect(body.projects.find((project) => project.project_slug === "lost-southern-lyricists-1890-1915")?.completion_percent).toBe(0);
  });

  it("captures updates signup with first-party storage only", async () => {
    const db = makeMockDb();
    const req = makeJsonRequest("/api/updates", {
      email: "reader@example.com",
      source: "contact",
      comments: 99,
    });

    const res = await worker.fetch(req, { ...baseEnv, DB: db } as never);
    const body = (await res.json()) as { ok: boolean; alreadySignedUp: boolean };

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.alreadySignedUp).toBe(false);
    expect(db.updates.get("reader@example.com")?.enriched).toBeUndefined();
  });

  it("rejects updates import without auth", async () => {
    const req = makeJsonRequest("/api/updates/import", {
      email: "reader@example.com",
      comments: 4,
    });

    const res = await worker.fetch(req, { ...baseEnv, DB: makeMockDb() } as never);
    const body = (await res.json()) as { ok: boolean; error: string };

    expect(res.status).toBe(401);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Unauthorized");
  });

  it("imports updates enrichment with auth", async () => {
    const db = makeMockDb();
    const req = makeJsonRequest("/api/updates/import", {
      email: "reader@example.com",
      comments: 4,
      source: "import",
    }, {
      "x-import-token": "import-secret",
    });

    const res = await worker.fetch(req, { ...baseEnv, DB: db } as never);
    const body = (await res.json()) as { ok: boolean; imported: boolean };

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.imported).toBe(true);
    expect(db.updates.get("reader@example.com")?.enriched).toBe(true);
  });

  it("accepts contact request and sends two emails", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const req = makeJsonRequest("/api/contact", {
      reason: "General",
      email: "person@example.com",
      message: "Hello",
    });

    const res = await worker.fetch(req, baseEnv as never);
    const body = (await res.json()) as { ok: boolean; id: string };

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.id.startsWith("CONTACT-")).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns a structured 500 on unexpected runtime errors", async () => {
    fetchMock.mockRejectedValue(new Error("downstream failure"));
    const req = makeJsonRequest("/api/contact", {
      reason: "General",
      email: "person@example.com",
      message: "Hello",
    });

    const res = await worker.fetch(req, baseEnv as never);
    const body = (await res.json()) as { ok: boolean; error: string };

    expect(res.status).toBe(500);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Internal server error");
  });

  it("rejects when turnstile is required but missing", async () => {
    const req = makeJsonRequest("/api/submit", {
      email: "person@example.com",
      note: "Hello",
    });

    const res = await worker.fetch(req, { ...baseEnv, TURNSTILE_SECRET: "secret" } as never);
    const body = (await res.json()) as { ok: boolean; error: string };

    expect(res.status).toBe(403);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Turnstile verification failed");
  });

  it("rate-limits repeated requests using the D1-backed path", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const db = makeMockDb();
    const env = {
      ...baseEnv,
      DB: db,
      RATE_LIMIT_MAX: "1",
      RATE_LIMIT_WINDOW_MS: "60000",
    };

    const first = await worker.fetch(
      makeJsonRequest("/api/submit", { email: "person@example.com", note: "hello" }, { "cf-connecting-ip": "203.0.113.8" }),
      env as never,
    );
    const second = await worker.fetch(
      makeJsonRequest("/api/submit", { email: "person@example.com", note: "hello again" }, { "cf-connecting-ip": "203.0.113.8" }),
      env as never,
    );
    const secondBody = (await second.json()) as { ok: boolean; error: string; retryAfter: number };

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    expect(secondBody.error).toBe("Too many requests");
    expect(db.rateLimits.size).toBeGreaterThan(0);
  });

  it("returns preflight CORS headers including import auth", async () => {
    const req = new Request("https://stexpedite.press/api/updates/import", {
      method: "OPTIONS",
      headers: { origin: "https://stexpedite.press" },
    });

    const res = await worker.fetch(req, baseEnv as never);

    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-headers")).toContain("x-import-token");
  });

  it("allows localhost dev origins for CORS", async () => {
    const req = new Request("https://stexpedite.press/api/projects", {
      method: "GET",
      headers: { origin: "http://localhost:8000" },
    });

    const res = await worker.fetch(req, { ...baseEnv, DB: makeMockDb() } as never);

    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe("http://localhost:8000");
  });
});

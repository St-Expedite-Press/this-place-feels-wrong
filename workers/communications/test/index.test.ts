import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker, { __testing } from "../src/index";

type TestEnv = {
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
  TO_EMAIL: string;
  TURNSTILE_SECRET?: string;
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_WINDOW_MS?: string;
  DB?: unknown;
};

const originalFetch = globalThis.fetch;
const fetchMock = vi.fn<typeof fetch>();

const baseEnv: TestEnv = {
  RESEND_API_KEY: "test-key",
  FROM_EMAIL: "St. Expedite Press <no-reply@stexpedite.press>",
  TO_EMAIL: "editor@stexpedite.press",
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

  it("returns 500 when storefront is not configured", async () => {
    const req = new Request("https://stexpedite.press/api/storefront", {
      method: "GET",
      headers: { origin: "https://stexpedite.press" },
    });
    const res = await worker.fetch(req, baseEnv as never);
    const body = (await res.json()) as { ok: boolean; error: string };

    expect(res.status).toBe(500);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Storefront not configured");
  });

  it("returns storefront catalog payload when configured", async () => {
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
        new Response(JSON.stringify({
          results: [{ name: "All", slug: "all" }],
        }), { status: 200 }),
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
    const body = (await res.json()) as {
      ok: boolean;
      collection: string;
      collections: Array<{ slug: string }>;
      products: Array<{ slug: string }>;
      shop: { url: string };
    };

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.collection).toBe("all");
    expect(body.collections.length).toBe(1);
    expect(body.products[0]?.slug).toBe("test-product");
    expect(body.shop.url).toBe("https://shop.stexpedite.press");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("returns 500 when projects catalog DB is not configured", async () => {
    const req = new Request("https://stexpedite.press/api/projects", {
      method: "GET",
      headers: { origin: "https://stexpedite.press" },
    });
    const res = await worker.fetch(req, baseEnv as never);
    const body = (await res.json()) as { ok: boolean; error: string };

    expect(res.status).toBe(500);
    expect(body.ok).toBe(false);
    expect(body.error).toBe("Projects list not configured");
  });

  it("returns projects catalog payload when DB is configured", async () => {
    const mockDb = {
      prepare: vi.fn(() => ({
        all: vi.fn(async () => ({
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
            },
          ],
        })),
      })),
    };

    const req = new Request("https://stexpedite.press/api/projects", {
      method: "GET",
      headers: { origin: "https://stexpedite.press" },
    });

    const res = await worker.fetch(req, { ...baseEnv, DB: mockDb } as never);
    const body = (await res.json()) as {
      ok: boolean;
      totals: { volumes: number; series: number };
      series: Array<{ key: string; count: number }>;
      projects: Array<{ project_slug: string }>;
    };

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.totals.volumes).toBe(2);
    expect(body.totals.series).toBe(2);
    expect(body.projects[0]?.project_slug).toBe("les-fievres-et-les-humeurs");
    expect(body.series.find((s) => s.key === "sexp-originals")?.count).toBe(1);
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
    const firstPayload = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body ?? "{}")) as {
      text?: string;
      html?: string;
    };
    expect(typeof firstPayload.text).toBe("string");
    expect(typeof firstPayload.html).toBe("string");
    expect(firstPayload.html?.includes("St. Expedite Press")).toBe(true);
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
    expect(res.headers.get("access-control-allow-origin")).toBe("https://stexpedite.press");
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
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rate-limits repeated requests from the same client", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const env = {
      ...baseEnv,
      RATE_LIMIT_MAX: "1",
      RATE_LIMIT_WINDOW_MS: "60000",
    };

    const first = await worker.fetch(
      makeJsonRequest(
        "/api/submit",
        { email: "person@example.com", note: "hello" },
        { "cf-connecting-ip": "203.0.113.8" },
      ),
      env as never,
    );
    const second = await worker.fetch(
      makeJsonRequest(
        "/api/submit",
        { email: "person@example.com", note: "hello again" },
        { "cf-connecting-ip": "203.0.113.8" },
      ),
      env as never,
    );
    const secondBody = (await second.json()) as { ok: boolean; error: string; retryAfter: number };

    expect(first.status).toBe(200);
    expect(second.status).toBe(429);
    expect(secondBody.ok).toBe(false);
    expect(secondBody.error).toBe("Too many requests");
    expect(secondBody.retryAfter).toBeGreaterThan(0);
  });
});

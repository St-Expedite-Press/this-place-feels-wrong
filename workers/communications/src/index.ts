type JsonRecord = Record<string, unknown>;

type Env = {
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
  TO_EMAIL: string;
  FOURTH_WALL_API_KEY?: string;
  DB?: unknown;
  TURNSTILE_SECRET?: string;
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_WINDOW_MS?: string;
};

function json(data: JsonRecord, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data), { ...init, headers });
}

function withCors(request: Request, response: Response) {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigins = new Set([
    "https://stexpedite.press",
    "http://localhost:8787",
    "http://127.0.0.1:8787",
  ]);

  const headers = new Headers(response.headers);
  if (allowedOrigins.has(origin)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("vary", "origin");
    headers.set("access-control-allow-credentials", "false");
  }
  headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  headers.set("access-control-allow-headers", "content-type");
  headers.set("access-control-max-age", "86400");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function intOrDefault(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function clientIp(request: Request) {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  const xff = request.headers.get("x-forwarded-for");
  if (!xff) return "";
  return xff.split(",")[0]?.trim() ?? "";
}

const RATE_LIMIT_STATE = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(request: Request, env: Env) {
  const ip = clientIp(request);
  if (!ip) return { allowed: true as const, retryAfterSec: 0 };

  const max = intOrDefault(env.RATE_LIMIT_MAX, 20);
  const windowMs = intOrDefault(env.RATE_LIMIT_WINDOW_MS, 60_000);
  const key = `${request.method}:${new URL(request.url).pathname}:${ip}`;
  const now = Date.now();

  const current = RATE_LIMIT_STATE.get(key);
  if (!current || now >= current.resetAt) {
    RATE_LIMIT_STATE.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true as const, retryAfterSec: 0 };
  }

  if (current.count >= max) {
    const retryAfterMs = Math.max(0, current.resetAt - now);
    return {
      allowed: false as const,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  current.count += 1;
  RATE_LIMIT_STATE.set(key, current);
  return { allowed: true as const, retryAfterSec: 0 };
}

function isProbablyEmail(value: string) {
  const email = value.trim();
  if (email.length < 3 || email.length > 320) return false;
  if (/\s/.test(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function refId(prefix: string) {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.getRandomValues(new Uint32Array(2));
  const suffix = Array.from(rand)
    .map((n) => n.toString(36).toUpperCase().padStart(6, "0"))
    .join("")
    .slice(0, 10);
  return `${prefix}-${ts}-${suffix}`;
}

async function sendEmail(env: Env, params: { to: string; subject: string; text: string; html?: string; replyTo?: string }) {
  const payload: Record<string, unknown> = {
    from: env.FROM_EMAIL,
    to: [params.to],
    subject: params.subject,
    text: params.text,
  };

  if (params.html) payload.html = params.html;
  if (params.replyTo) payload.reply_to = [params.replyTo];

  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`Resend error (${resp.status}): ${body.slice(0, 500)}`);
  }
}

async function parseJson(request: Request) {
  const ct = request.headers.get("content-type") ?? "";
  if (!ct.toLowerCase().includes("application/json")) return null;
  try {
    return (await request.json()) as JsonRecord;
  } catch {
    return null;
  }
}

function normalizeText(value: unknown, maxLen: number) {
  const text = String(value ?? "").replace(/\r\n/g, "\n").trim();
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) : text;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function nlToBr(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

const BRAND = {
  name: "St. Expedite Press",
  siteUrl: "https://stexpedite.press",
  logoUrl: "https://stexpedite.press/assets/img/favicon.svg",
  accent: "#d8c27a",
  accentSoft: "#a58f4a",
  bg: "#070808",
  panel: "#111315",
  panelAlt: "#0b0c0d",
  border: "#2a2d31",
  text: "#efefef",
  textMuted: "#b4bac2",
  textSubtle: "#9198a1",
};

function renderEmailShell(params: {
  preheader: string;
  title: string;
  subtitle?: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}) {
  const preheader = escapeHtml(params.preheader);
  const title = escapeHtml(params.title);
  const subtitle = params.subtitle ? escapeHtml(params.subtitle) : "";
  const footerNote = params.footerNote ? escapeHtml(params.footerNote) : BRAND.name;
  const ctaLabel = params.ctaLabel ? escapeHtml(params.ctaLabel) : "";
  const ctaUrl = params.ctaUrl ? escapeHtml(params.ctaUrl) : "";

  return [
    "<!doctype html>",
    '<html lang="en">',
    "  <body style=\"margin:0;padding:0;background:#050606;color:#f6f6f6;font-family:Georgia,'Times New Roman',serif;\">",
    `    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>`,
    `    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${BRAND.bg};padding:24px 0;">`,
    "      <tr>",
    '        <td align="center">',
    `          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:640px;max-width:92%;background:${BRAND.panel};border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;">`,
    "            <tr>",
    `              <td style="padding:24px 28px;background:linear-gradient(120deg,${BRAND.panelAlt} 0%,#171a1e 45%,#111315 100%);border-bottom:1px solid ${BRAND.border};">`,
    `                <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td valign="middle" style="width:40px;padding:0 12px 0 0;"><img src="${BRAND.logoUrl}" alt="${BRAND.name}" width="32" height="32" style="display:block;border:0;max-width:32px;height:auto;" /></td><td valign="middle"><div style="font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:${BRAND.textMuted};">${BRAND.name}</div></td></tr></table>`,
    `                <h1 style="margin:14px 0 0;font-size:29px;line-height:1.18;color:${BRAND.text};font-weight:600;">${title}</h1>`,
    subtitle
      ? `                <p style="margin:9px 0 0;font-size:14px;line-height:1.55;color:${BRAND.textMuted};">${subtitle}</p>`
      : "",
    "              </td>",
    "            </tr>",
    "            <tr>",
    `              <td style="padding:24px 28px;font-size:15px;line-height:1.7;color:${BRAND.text};">`,
    `                ${params.bodyHtml}`,
    "              </td>",
    "            </tr>",
    ctaLabel && ctaUrl
      ? "            <tr>"
      : "",
    ctaLabel && ctaUrl
      ? `              <td style="padding:0 28px 20px;">`
      : "",
    ctaLabel && ctaUrl
      ? `                <a href="${ctaUrl}" style="display:inline-block;background:${BRAND.accent};color:#141414;text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.3px;padding:11px 16px;border-radius:8px;">${ctaLabel}</a>`
      : "",
    ctaLabel && ctaUrl
      ? "              </td>"
      : "",
    ctaLabel && ctaUrl
      ? "            </tr>"
      : "",
    "            <tr>",
    `              <td style="padding:18px 28px;border-top:1px solid ${BRAND.border};font-size:12px;line-height:1.55;color:${BRAND.textSubtle};">`,
    `                <div>${footerNote}</div>`,
    `                <div style="margin-top:6px;color:${BRAND.accentSoft};">${BRAND.name} // New Orleans, LA</div>`,
    "              </td>",
    "            </tr>",
    "          </table>",
    "        </td>",
    "      </tr>",
    "    </table>",
    "  </body>",
    "</html>",
  ]
    .filter(Boolean)
    .join("\n");
}

function renderContactEditorHtml(params: { id: string; reason: string; fromEmail: string; message: string }) {
  const reasonHtml = params.reason
    ? `<p style="margin:0 0 8px;"><strong>Reason:</strong> ${escapeHtml(params.reason)}</p>`
    : "";
  return renderEmailShell({
    preheader: `Contact form submission ${params.id}`,
    title: "New Contact Submission",
    subtitle: params.id,
    bodyHtml: [
      `<p style="margin:0 0 8px;"><strong>From:</strong> ${escapeHtml(params.fromEmail)}</p>`,
      reasonHtml,
      '<p style="margin:16px 0 8px;"><strong>Message</strong></p>',
      `<p style="margin:0;padding:14px;border:1px solid ${BRAND.border};border-radius:8px;background:${BRAND.panelAlt};">${nlToBr(params.message)}</p>`,
    ].join("\n"),
    ctaLabel: "Open Inbox",
    ctaUrl: "https://mail.zoho.com/",
    footerNote: "Inbound message delivered via communications worker.",
  });
}

function renderSubmitEditorHtml(params: { id: string; fromEmail: string; note: string }) {
  return renderEmailShell({
    preheader: `Submission inquiry ${params.id}`,
    title: "New Submission Inquiry",
    subtitle: params.id,
    bodyHtml: [
      `<p style="margin:0 0 8px;"><strong>From:</strong> ${escapeHtml(params.fromEmail)}</p>`,
      '<p style="margin:16px 0 8px;"><strong>Note</strong></p>',
      `<p style="margin:0;padding:14px;border:1px solid ${BRAND.border};border-radius:8px;background:${BRAND.panelAlt};">${nlToBr(params.note || "(no note)")}</p>`,
    ].join("\n"),
    ctaLabel: "Open Inbox",
    ctaUrl: "https://mail.zoho.com/",
    footerNote: "Inbound inquiry delivered via communications worker.",
  });
}

function renderReceiptHtml(params: { id: string; heading: string; detail: string }) {
  return renderEmailShell({
    preheader: `Reference ${params.id}`,
    title: params.heading,
    subtitle: `Reference: ${params.id}`,
    bodyHtml: [
      `<p style="margin:0 0 12px;">${escapeHtml(params.detail)}</p>`,
      '<p style="margin:0;">Reply directly to this email and include your reference so we can thread your request quickly.</p>',
    ].join("\n"),
    ctaLabel: "Visit St. Expedite Press",
    ctaUrl: BRAND.siteUrl,
    footerNote: "This is an automated transactional receipt.",
  });
}

function pickHoneypot(body: JsonRecord | null) {
  const raw = body?.website ?? body?.company ?? body?.hp ?? "";
  return String(raw ?? "").trim();
}

function pickTurnstileToken(body: JsonRecord | null) {
  const raw = body?.turnstileToken ?? body?.["cf-turnstile-response"] ?? "";
  return String(raw ?? "").trim();
}

function normalizeDomain(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

async function fetchFourthwallJson(token: string, path: string) {
  const qs = new URLSearchParams({ storefront_token: token });
  const resp = await fetch(`https://storefront-api.fourthwall.com${path}?${qs.toString()}`, {
    method: "GET",
    headers: { accept: "application/json" },
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`Fourthwall error (${resp.status}): ${body.slice(0, 400)}`);
  }

  return (await resp.json()) as JsonRecord;
}

async function verifyTurnstile(request: Request, env: Env, token: string) {
  const secret = String(env.TURNSTILE_SECRET ?? "").trim();
  if (!secret) return true;
  if (!token) return false;

  const ip = clientIp(request);
  const payload = new URLSearchParams({
    secret,
    response: token,
  });
  if (ip) payload.set("remoteip", ip);

  try {
    const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: payload.toString(),
    });
    if (!resp.ok) return false;
    const data = (await resp.json().catch(() => ({}))) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    try {
      // Lightweight runtime probe for deploy validation and monitoring checks.
      if (url.pathname === "/api/health" && request.method === "GET") {
        const db = (env as unknown as { DB?: any }).DB;
        return withCors(
          request,
          json(
            {
              ok: true,
              service: "communications-worker",
              dbConfigured: Boolean(db?.prepare),
              now: new Date().toISOString(),
            },
            { status: 200 },
          ),
        );
      }

      if (url.pathname === "/api/storefront" && request.method === "GET") {
        const token = String(env.FOURTH_WALL_API_KEY ?? "").trim();
        if (!token) {
          return withCors(
            request,
            json({ ok: false, error: "Storefront not configured" }, { status: 500 }),
          );
        }

        try {
          const requestedCollection = normalizeText(url.searchParams.get("collection"), 120);
          const [shopData, collectionsData] = await Promise.all([
            fetchFourthwallJson(token, "/v1/shop"),
            fetchFourthwallJson(token, "/v1/collections"),
          ]);

          const shop = shopData as {
            id?: string;
            name?: string;
            domain?: string;
            publicDomain?: string;
          };
          const collections = ((collectionsData as { results?: unknown[] }).results ?? [])
            .map((raw) => raw as { name?: string; slug?: string })
            .filter((c) => c?.slug)
            .map((c) => ({
              name: String(c.name ?? c.slug ?? "Collection"),
              slug: String(c.slug ?? ""),
            }));
          const selectedCollection = requestedCollection
            || collections.find((c) => c.slug === "all")?.slug
            || collections[0]?.slug
            || "all";
          const productsData = await fetchFourthwallJson(
            token,
            `/v1/collections/${encodeURIComponent(selectedCollection)}/products`,
          );
          const rawProducts = ((productsData as { results?: unknown[] }).results ?? [])
            .map((raw) => raw as {
              id?: string;
              name?: string;
              slug?: string;
              description?: string;
              images?: Array<{ url?: string; transformedUrl?: string }>;
              variants?: Array<{ unitPrice?: { value?: number; currency?: string } }>;
            });

          const products = rawProducts.map((p) => {
            const firstImage = p.images?.[0];
            const firstPrice = p.variants?.[0]?.unitPrice;
            const priceValue = typeof firstPrice?.value === "number"
              ? firstPrice.value.toFixed(2)
              : "";
            return {
              id: String(p.id ?? ""),
              name: String(p.name ?? "Product"),
              slug: String(p.slug ?? ""),
              description: String(p.description ?? ""),
              image: String(firstImage?.transformedUrl ?? firstImage?.url ?? ""),
              priceValue,
              priceCurrency: String(firstPrice?.currency ?? ""),
            };
          });

          const shopUrl = normalizeDomain(String(shop.publicDomain ?? shop.domain ?? ""));
          return withCors(
            request,
            json({
              ok: true,
              shop: {
                id: String(shop.id ?? ""),
                name: String(shop.name ?? "Store"),
                domain: String(shop.publicDomain ?? shop.domain ?? ""),
                url: shopUrl,
              },
              collection: selectedCollection,
              collections,
              products,
            }, { status: 200 }),
          );
        } catch (error) {
          console.error("Storefront fetch failed", {
            message: error instanceof Error ? error.message : String(error),
          });
          return withCors(
            request,
            json({ ok: false, error: "Storefront unavailable" }, { status: 502 }),
          );
        }
      }

      if (request.method === "OPTIONS") {
        return withCors(request, new Response(null, { status: 204 }));
      }

      if (request.method !== "POST") {
        return withCors(request, json({ ok: false, error: "Not found" }, { status: 404 }));
      }

      const limit = checkRateLimit(request, env);
      if (!limit.allowed) {
        return withCors(
          request,
          json({ ok: false, error: "Too many requests", retryAfter: limit.retryAfterSec }, {
            status: 429,
            headers: { "retry-after": String(limit.retryAfterSec) },
          }),
        );
      }

      const body = await parseJson(request);
      if (!body) {
        return withCors(request, json({ ok: false, error: "Invalid JSON" }, { status: 400 }));
      }

      // Basic bot honeypot: if filled, accept but do nothing.
      if (pickHoneypot(body)) {
        if (url.pathname === "/api/updates") {
          return withCors(request, json({ ok: true, alreadySignedUp: false }, { status: 200 }));
        }
        return withCors(request, json({ ok: true }, { status: 200 }));
      }

      const turnstileToken = pickTurnstileToken(body);
      const turnstileOk = await verifyTurnstile(request, env, turnstileToken);
      if (!turnstileOk) {
        return withCors(request, json({ ok: false, error: "Turnstile verification failed" }, { status: 403 }));
      }

      if (url.pathname === "/api/updates") {
        const fromEmail = normalizeText(body.email, 320);
        const source = normalizeText(body.source, 80);

        if (!isProbablyEmail(fromEmail)) {
          return withCors(request, json({ ok: false, error: "Missing fields" }, { status: 400 }));
        }

        const db = (env as unknown as { DB?: any }).DB;
        if (!db?.prepare) {
          return withCors(
            request,
            json({ ok: false, error: "Updates list not configured" }, { status: 500 }),
          );
        }

        const ua = request.headers.get("user-agent") ?? "";
        const existing = await db
          .prepare(
            `
            SELECT email
            FROM updates_signups
            WHERE lower(email) = lower(?)
            LIMIT 1
          `,
          )
          .bind(fromEmail)
          .first<{ email: string }>();
        const canonicalEmail = String(existing?.email ?? fromEmail);
        const alreadySignedUp = Boolean(existing?.email);

        await db
          .prepare(
            `
            INSERT INTO updates_signups (email, first_seen_at, last_seen_at, source, user_agent, unsubscribed_at)
            VALUES (?, datetime('now'), datetime('now'), ?, ?, NULL)
            ON CONFLICT(email) DO UPDATE SET
              last_seen_at = datetime('now'),
              source = excluded.source,
              user_agent = excluded.user_agent,
              unsubscribed_at = NULL
          `,
          )
          .bind(canonicalEmail, source || null, ua.slice(0, 400))
          .run();

        return withCors(request, json({ ok: true, alreadySignedUp }, { status: 200 }));
      }

      if (url.pathname === "/api/contact") {
        if (!env.RESEND_API_KEY || !env.FROM_EMAIL || !env.TO_EMAIL) {
          return withCors(
            request,
            json({ ok: false, error: "Server not configured" }, { status: 500 }),
          );
        }

        const fromEmail = normalizeText(body.email, 320);
        const reason = normalizeText(body.reason, 120);
        const message = normalizeText(body.message, 6000);

        if (!isProbablyEmail(fromEmail) || !message) {
          return withCors(request, json({ ok: false, error: "Missing fields" }, { status: 400 }));
        }

        const id = refId("CONTACT");
        const subject = `St. Expedite Press — Contact${reason ? ` (${reason})` : ""} — ${id}`;
        const editorText = [
          "Contact form submission",
          "",
          `Ref: ${id}`,
          reason ? `Reason: ${reason}` : null,
          `From: ${fromEmail}`,
          "",
          message,
        ]
          .filter(Boolean)
          .join("\n");

        const editorHtml = renderContactEditorHtml({
          id,
          reason,
          fromEmail,
          message,
        });
        await sendEmail(env, {
          to: env.TO_EMAIL,
          subject,
          text: editorText,
          html: editorHtml,
          replyTo: fromEmail,
        });

        const receiptSubject = `Received — ${id}`;
        const receiptText = [
          "Your message to St. Expedite Press has been received.",
          "",
          `Reference: ${id}`,
          "If you need to add detail, reply to this email and include the reference in your message.",
          "",
          "— St. Expedite Press",
        ].join("\n");

        const receiptHtml = renderReceiptHtml({
          id,
          heading: "Contact Message Received",
          detail: "Your message to St. Expedite Press has been received.",
        });
        await sendEmail(env, {
          to: fromEmail,
          subject: receiptSubject,
          text: receiptText,
          html: receiptHtml,
          replyTo: env.TO_EMAIL,
        });

        return withCors(request, json({ ok: true, id }, { status: 200 }));
      }

      if (url.pathname === "/api/submit") {
        if (!env.RESEND_API_KEY || !env.FROM_EMAIL || !env.TO_EMAIL) {
          return withCors(
            request,
            json({ ok: false, error: "Server not configured" }, { status: 500 }),
          );
        }

        const fromEmail = normalizeText(body.email, 320);
        const note = normalizeText(body.note, 6000);

        if (!isProbablyEmail(fromEmail)) {
          return withCors(request, json({ ok: false, error: "Missing fields" }, { status: 400 }));
        }

        const id = refId("SUBMIT");
        const subject = `St. Expedite Press — Submission — ${id}`;
        const editorText = [
          "Submission / inquiry",
          "",
          `Ref: ${id}`,
          `From: ${fromEmail}`,
          "",
          note ? note : "(no note)",
        ].join("\n");

        const editorHtml = renderSubmitEditorHtml({
          id,
          fromEmail,
          note,
        });
        await sendEmail(env, {
          to: env.TO_EMAIL,
          subject,
          text: editorText,
          html: editorHtml,
          replyTo: fromEmail,
        });

        const receiptSubject = `Received — ${id}`;
        const receiptText = [
          "Your submission inquiry has been received.",
          "",
          `Reference: ${id}`,
          "If you need to send attachments, reply to this email and include the reference in your subject line.",
          "",
          "— St. Expedite Press",
        ].join("\n");

        const receiptHtml = renderReceiptHtml({
          id,
          heading: "Submission Inquiry Received",
          detail: "Your submission inquiry has been received.",
        });
        await sendEmail(env, {
          to: fromEmail,
          subject: receiptSubject,
          text: receiptText,
          html: receiptHtml,
          replyTo: env.TO_EMAIL,
        });

        return withCors(request, json({ ok: true, id }, { status: 200 }));
      }

      return withCors(request, json({ ok: false, error: "Not found" }, { status: 404 }));
    } catch (error) {
      console.error("Unhandled worker error", {
        path: url.pathname,
        method: request.method,
        message: error instanceof Error ? error.message : String(error),
      });
      return withCors(request, json({ ok: false, error: "Internal server error" }, { status: 500 }));
    }
  },
};

export const __testing = {
  clearRateLimitState() {
    RATE_LIMIT_STATE.clear();
  },
};

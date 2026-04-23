type JsonRecord = Record<string, unknown>;

type D1Statement = {
  bind: (...values: unknown[]) => {
    first: <T>() => Promise<T | null>;
    run: () => Promise<unknown>;
    all: <T>() => Promise<{ results?: T[] }>;
  };
  first?: <T>() => Promise<T | null>;
  run?: () => Promise<unknown>;
  all?: <T>() => Promise<{ results?: T[] }>;
};

type D1Database = {
  prepare: (query: string) => D1Statement;
};

type Env = {
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
  TO_EMAIL: string;
  STRIPE_SECRET_KEY?: string;
  FOURTH_WALL_API_KEY?: string;
  FW_STOREFRONT_TOKEN?: string;
  DB?: D1Database;
  TURNSTILE_SECRET?: string;
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_WINDOW_MS?: string;
  UPDATES_IMPORT_TOKEN?: string;
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
    "https://www.stexpedite.press",
  ]);
  const isLocalOrigin = /^http:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(origin);

  const headers = new Headers(response.headers);
  if (allowedOrigins.has(origin) || isLocalOrigin) {
    headers.set("access-control-allow-origin", origin);
    headers.set("vary", "origin");
    headers.set("access-control-allow-credentials", "false");
  }
  headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  headers.set("access-control-allow-headers", "content-type, x-import-token");
  headers.set("access-control-max-age", "86400");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function withCache(response: Response, cacheControl: string) {
  const headers = new Headers(response.headers);
  headers.set("cache-control", cacheControl);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function ok(data: JsonRecord, init?: ResponseInit) {
  return json({ ok: true, ...data }, init);
}

function errorResponse(message: string, status: number, init?: ResponseInit) {
  return json({ ok: false, error: message }, { ...init, status });
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

function normalizeText(value: unknown, maxLen: number) {
  const text = String(value ?? "").replace(/\r\n/g, "\n").trim();
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) : text;
}

function normalizeNullableText(value: unknown, maxLen: number) {
  const text = normalizeText(value, maxLen);
  return text || null;
}

function normalizeNullableInt(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) ? parsed : null;
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

function pickHoneypot(body: JsonRecord | null) {
  const raw = body?.website ?? body?.company ?? body?.hp ?? "";
  return String(raw ?? "").trim();
}

function pickTurnstileToken(body: JsonRecord | null) {
  const raw = body?.turnstileToken ?? body?.["cf-turnstile-response"] ?? "";
  return String(raw ?? "").trim();
}

function pickField(body: JsonRecord, ...keys: string[]) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      return body[key];
    }
  }
  return undefined;
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

function normalizeDomain(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
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

const STRIPE_API_VERSION = "2026-02-25.clover";
const DONATION_MIN_CENTS = 500;
const DONATION_MAX_CENTS = 100000;

function parseDonationAmountCents(body: JsonRecord) {
  const rawCents = pickField(body, "amountCents", "amount_cents");
  if (rawCents !== undefined && rawCents !== null && rawCents !== "") {
    const parsed = Number.parseInt(String(rawCents), 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  const rawAmount = pickField(body, "amount");
  const normalized = String(rawAmount ?? "").replace(/[$,\s]/g, "").trim();
  if (!normalized) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;

  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100);
}

async function createStripeCheckoutSession(env: Env, params: { amountCents: number }) {
  const secret = String(env.STRIPE_SECRET_KEY ?? "").trim();
  if (!secret) {
    throw new Error("Stripe not configured");
  }

  const body = new URLSearchParams();
  body.set("mode", "payment");
  body.set("submit_type", "donate");
  body.set("success_url", `${BRAND.siteUrl}/donate/thanks?session_id={CHECKOUT_SESSION_ID}`);
  body.set("cancel_url", `${BRAND.siteUrl}/donate`);
  body.set("line_items[0][quantity]", "1");
  body.set("line_items[0][price_data][currency]", "usd");
  body.set("line_items[0][price_data][unit_amount]", String(params.amountCents));
  body.set("line_items[0][price_data][product_data][name]", "Donation");
  body.set("line_items[0][price_data][product_data][description]", "Support St. Expedite Press");
  body.set("payment_intent_data[metadata][source]", "site_donate");
  body.set("payment_intent_data[metadata][amount_cents]", String(params.amountCents));
  body.set("metadata[source]", "site_donate");
  body.set("metadata[amount_cents]", String(params.amountCents));

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${secret}`,
      "content-type": "application/x-www-form-urlencoded",
      "stripe-version": STRIPE_API_VERSION,
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Stripe error (${response.status}): ${errorBody.slice(0, 500)}`);
  }

  const data = (await response.json().catch(() => ({}))) as { id?: string; url?: string };
  return {
    id: String(data.id ?? ""),
    url: String(data.url ?? ""),
  };
}

async function sendEmail(env: Env, params: { to: string; subject: string; text: string; html?: string; replyTo?: string }): Promise<string> {
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

  const data = (await resp.json().catch(() => ({}))) as { id?: string };
  return String(data?.id ?? "");
}

async function logSubmission(db: D1Database | undefined, params: {
  id: string;
  type: "contact" | "submit";
  email: string;
  reason: string | null;
  message: string | null;
  editorEmailId: string;
  receiptEmailId: string;
}) {
  if (!db?.prepare) return;
  try {
    await db
      .prepare(
        `INSERT INTO contact_submissions (id, type, email, reason, message, received_at, editor_email_id, receipt_email_id)
         VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?)`,
      )
      .bind(params.id, params.type, params.email, params.reason, params.message, params.editorEmailId, params.receiptEmailId)
      .run();
  } catch (error) {
    console.warn("Failed to log submission to D1", {
      id: params.id,
      message: error instanceof Error ? error.message : String(error),
    });
  }
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

  const payload = new URLSearchParams({ secret, response: token });
  const ip = clientIp(request);
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

const BRAND = {
  name: "St. Expedite Press",
  siteUrl: "https://stexpedite.press",
  logoUrl: "https://stexpedite.press/assets/img/favicon.svg",
  accentSoft: "rgba(42, 255, 138, 0.55)",
  bg: "#050807",
  panel: "rgba(5, 8, 7, 0.95)",
  panelAlt: "rgba(4, 7, 6, 0.96)",
  border: "rgba(42, 255, 138, 0.24)",
  text: "#d6ffe8",
  textMuted: "rgba(42, 255, 138, 0.86)",
  textSubtle: "rgba(42, 255, 138, 0.72)",
  relief: "#d96aff",
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
    `  <body style="margin:0;padding:0;background:${BRAND.bg};color:${BRAND.text};font-family:'Cormorant Garamond', Georgia, 'Times New Roman', serif;">`,
    `    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>`,
    `    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:radial-gradient(circle at 50% 12%, rgba(42,255,138,0.10), ${BRAND.bg} 62%);padding:24px 0;">`,
    "      <tr>",
    '        <td align="center">',
    `          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:640px;max-width:92%;background:${BRAND.panel};border:1px solid ${BRAND.border};border-radius:14px;overflow:hidden;box-shadow:0 0 26px rgba(42,255,138,0.16),0 0 48px rgba(42,255,138,0.10);">`,
    "            <tr>",
    `              <td style="padding:24px 28px;background:linear-gradient(120deg, ${BRAND.panelAlt} 0%, rgba(42,255,138,0.08) 45%, rgba(5,8,7,0.98) 100%);border-bottom:1px solid ${BRAND.border};">`,
    `                <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td valign="middle" style="width:40px;padding:0 12px 0 0;"><img src="${BRAND.logoUrl}" alt="${BRAND.name}" width="32" height="32" style="display:block;border:0;max-width:32px;height:auto;" /></td><td valign="middle"><div style="font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:${BRAND.textMuted};">${BRAND.name}</div></td></tr></table>`,
    `                <h1 style="margin:14px 0 0;font-size:29px;line-height:1.18;color:${BRAND.text};font-weight:600;letter-spacing:1.1px;text-transform:uppercase;font-family:'Cinzel','Cormorant Garamond',Georgia,serif;text-shadow:0 0 12px rgba(42,255,138,0.35),0 0 22px rgba(42,255,138,0.24);">${title}</h1>`,
    subtitle ? `                <p style="margin:9px 0 0;font-size:14px;line-height:1.55;color:${BRAND.textMuted};">${subtitle}</p>` : "",
    "              </td>",
    "            </tr>",
    "            <tr>",
    `              <td style="padding:24px 28px;font-size:15px;line-height:1.7;color:${BRAND.text};">${params.bodyHtml}</td>`,
    "            </tr>",
    ctaLabel && ctaUrl ? "            <tr>" : "",
    ctaLabel && ctaUrl ? `              <td style="padding:0 28px 20px;"><a href="${ctaUrl}" style="display:inline-block;background:rgba(42,255,138,0.12);border:1px solid rgba(42,255,138,0.62);color:${BRAND.text};text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.8px;text-transform:uppercase;padding:11px 16px;border-radius:999px;text-shadow:0 0 8px rgba(42,255,138,0.4);box-shadow:0 0 18px rgba(42,255,138,0.24);font-family:'Cinzel','Cormorant Garamond',Georgia,serif;">${ctaLabel}</a></td>` : "",
    ctaLabel && ctaUrl ? "            </tr>" : "",
    "            <tr>",
    `              <td style="padding:18px 28px;border-top:1px solid ${BRAND.border};font-size:12px;line-height:1.55;color:${BRAND.textSubtle};"><div>${footerNote}</div><div style="margin-top:6px;color:${BRAND.accentSoft};text-shadow:0 0 8px rgba(42,255,138,0.32), 0 0 12px ${BRAND.relief};">${BRAND.name} // New Orleans, LA</div></td>`,
    "            </tr>",
    "          </table>",
    "        </td>",
    "      </tr>",
    "    </table>",
    "  </body>",
    "</html>",
  ].filter(Boolean).join("\n");
}

function renderContactEditorHtml(params: { id: string; reason: string; fromEmail: string; message: string }) {
  return renderEmailShell({
    preheader: `Contact form submission ${params.id}`,
    title: "New Contact Submission",
    subtitle: params.id,
    bodyHtml: [
      `<p style="margin:0 0 8px;"><strong>From:</strong> ${escapeHtml(params.fromEmail)}</p>`,
      params.reason ? `<p style="margin:0 0 8px;"><strong>Reason:</strong> ${escapeHtml(params.reason)}</p>` : "",
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

function enrichUpdatesRecord(body: JsonRecord) {
  return {
    name: normalizeNullableText(pickField(body, "name"), 200),
    stripePlan: normalizeNullableText(pickField(body, "stripe_plan", "stripePlan"), 120),
    cancelDate: normalizeNullableText(pickField(body, "cancel_date", "cancelDate"), 40),
    startDate: normalizeNullableText(pickField(body, "start_date", "startDate"), 40),
    paidUpgradeDate: normalizeNullableText(pickField(body, "paid_upgrade_date", "paidUpgradeDate"), 40),
    bestseller: normalizeNullableInt(pickField(body, "bestseller")),
    emailsReceived6mo: normalizeNullableInt(pickField(body, "emails_received_6mo", "emailsReceived6mo")),
    emailsDropped6mo: normalizeNullableInt(pickField(body, "emails_dropped_6mo", "emailsDropped6mo")),
    numEmailsOpened: normalizeNullableInt(pickField(body, "num_emails_opened", "numEmailsOpened")),
    emailsOpened6mo: normalizeNullableInt(pickField(body, "emails_opened_6mo", "emailsOpened6mo")),
    emailsOpened7d: normalizeNullableInt(pickField(body, "emails_opened_7d", "emailsOpened7d")),
    emailsOpened30d: normalizeNullableInt(pickField(body, "emails_opened_30d", "emailsOpened30d")),
    lastEmailOpen: normalizeNullableText(pickField(body, "last_email_open", "lastEmailOpen"), 40),
    linksClicked: normalizeNullableInt(pickField(body, "links_clicked", "linksClicked")),
    lastClickedAt: normalizeNullableText(pickField(body, "last_clicked_at", "lastClickedAt"), 40),
    uniqueEmailsSeen6mo: normalizeNullableInt(pickField(body, "unique_emails_seen_6mo", "uniqueEmailsSeen6mo")),
    uniqueEmailsSeen7d: normalizeNullableInt(pickField(body, "unique_emails_seen_7d", "uniqueEmailsSeen7d")),
    uniqueEmailsSeen30d: normalizeNullableInt(pickField(body, "unique_emails_seen_30d", "uniqueEmailsSeen30d")),
    postViews: normalizeNullableInt(pickField(body, "post_views", "postViews")),
    postViews7d: normalizeNullableInt(pickField(body, "post_views_7d", "postViews7d")),
    postViews30d: normalizeNullableInt(pickField(body, "post_views_30d", "postViews30d")),
    uniquePostsSeen: normalizeNullableInt(pickField(body, "unique_posts_seen", "uniquePostsSeen")),
    uniquePostsSeen7d: normalizeNullableInt(pickField(body, "unique_posts_seen_7d", "uniquePostsSeen7d")),
    uniquePostsSeen30d: normalizeNullableInt(pickField(body, "unique_posts_seen_30d", "uniquePostsSeen30d")),
    comments: normalizeNullableInt(pickField(body, "comments")),
    comments7d: normalizeNullableInt(pickField(body, "comments_7d", "comments7d")),
    comments30d: normalizeNullableInt(pickField(body, "comments_30d", "comments30d")),
    shares: normalizeNullableInt(pickField(body, "shares")),
    shares7d: normalizeNullableInt(pickField(body, "shares_7d", "shares7d")),
    shares30d: normalizeNullableInt(pickField(body, "shares_30d", "shares30d")),
    subscriptionsGifted: normalizeNullableInt(pickField(body, "subscriptions_gifted", "subscriptionsGifted")),
    firstPaidDate: normalizeNullableText(pickField(body, "first_paid_date", "firstPaidDate"), 40),
    revenue: normalizeNullableText(pickField(body, "revenue"), 40),
    subscriptionSourceFree: normalizeNullableText(pickField(body, "subscription_source_free", "subscriptionSourceFree"), 120),
    subscriptionSourcePaid: normalizeNullableText(pickField(body, "subscription_source_paid", "subscriptionSourcePaid"), 120),
    daysActive30d: normalizeNullableInt(pickField(body, "days_active_30d", "daysActive30d")),
    activity: normalizeNullableInt(pickField(body, "activity")),
    country: normalizeNullableText(pickField(body, "country"), 12),
    stateProvince: normalizeNullableText(pickField(body, "state_province", "stateProvince"), 80),
    expirationDate: normalizeNullableText(pickField(body, "expiration_date", "expirationDate"), 40),
    type: normalizeNullableText(pickField(body, "type"), 80),
    sections: normalizeNullableText(pickField(body, "sections"), 400),
  };
}

async function checkRateLimit(request: Request, env: Env) {
  const ip = clientIp(request);
  const db = env.DB;
  if (!ip || !db?.prepare) {
    return { allowed: true as const, retryAfterSec: 0, mode: "open" };
  }

  const max = intOrDefault(env.RATE_LIMIT_MAX, 20);
  const windowMs = intOrDefault(env.RATE_LIMIT_WINDOW_MS, 60_000);
  const now = Date.now();
  const bucketStart = now - (now % windowMs);
  const resetAt = bucketStart + windowMs;
  const bucketKey = `${request.method}:${new URL(request.url).pathname}:${ip}:${bucketStart}`;

  try {
    const existing = await db
      .prepare("SELECT count, reset_at FROM api_rate_limits WHERE bucket_key = ? LIMIT 1")
      .bind(bucketKey)
      .first<{ count: number; reset_at: number }>();

    if (!existing || now >= Number(existing.reset_at ?? 0)) {
      await db
        .prepare(
          `
          INSERT INTO api_rate_limits (bucket_key, count, reset_at)
          VALUES (?, 1, ?)
          ON CONFLICT(bucket_key) DO UPDATE SET count = 1, reset_at = excluded.reset_at
          `,
        )
        .bind(bucketKey, resetAt)
        .run();
      await db.prepare("DELETE FROM api_rate_limits WHERE reset_at < ?").bind(now - windowMs).run();
      return { allowed: true as const, retryAfterSec: 0, mode: "d1" };
    }

    if (Number(existing.count) >= max) {
      return {
        allowed: false as const,
        retryAfterSec: Math.max(1, Math.ceil((Number(existing.reset_at) - now) / 1000)),
        mode: "d1",
      };
    }

    await db.prepare("UPDATE api_rate_limits SET count = count + 1 WHERE bucket_key = ?").bind(bucketKey).run();
    return { allowed: true as const, retryAfterSec: 0, mode: "d1" };
  } catch (error) {
    console.warn("D1 rate limit unavailable; allowing request", {
      message: error instanceof Error ? error.message : String(error),
    });
    return { allowed: true as const, retryAfterSec: 0, mode: "open" };
  }
}

async function upsertUpdatesSignup(db: D1Database, email: string, source: string | null, userAgent: string) {
  const existing = await db
    .prepare(
      `
      SELECT email
      FROM updates_signups
      WHERE lower(email) = lower(?)
      LIMIT 1
      `,
    )
    .bind(email)
    .first<{ email: string }>();
  const canonicalEmail = String(existing?.email ?? email);
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
    .bind(canonicalEmail, source, userAgent.slice(0, 400))
    .run();

  return { canonicalEmail, alreadySignedUp };
}

async function applyUpdatesEnrichment(db: D1Database, email: string, body: JsonRecord) {
  const enrichedRecord = enrichUpdatesRecord(body);
  await db
    .prepare(
      `
      UPDATE updates_signups
      SET
        name = COALESCE(?, name),
        stripe_plan = COALESCE(?, stripe_plan),
        cancel_date = COALESCE(?, cancel_date),
        start_date = COALESCE(start_date, ?, first_seen_at),
        paid_upgrade_date = COALESCE(?, paid_upgrade_date),
        bestseller = COALESCE(?, bestseller),
        emails_received_6mo = COALESCE(?, emails_received_6mo),
        emails_dropped_6mo = COALESCE(?, emails_dropped_6mo),
        num_emails_opened = COALESCE(?, num_emails_opened),
        emails_opened_6mo = COALESCE(?, emails_opened_6mo),
        emails_opened_7d = COALESCE(?, emails_opened_7d),
        emails_opened_30d = COALESCE(?, emails_opened_30d),
        last_email_open = COALESCE(?, last_email_open),
        links_clicked = COALESCE(?, links_clicked),
        last_clicked_at = COALESCE(?, last_clicked_at),
        unique_emails_seen_6mo = COALESCE(?, unique_emails_seen_6mo),
        unique_emails_seen_7d = COALESCE(?, unique_emails_seen_7d),
        unique_emails_seen_30d = COALESCE(?, unique_emails_seen_30d),
        post_views = COALESCE(?, post_views),
        post_views_7d = COALESCE(?, post_views_7d),
        post_views_30d = COALESCE(?, post_views_30d),
        unique_posts_seen = COALESCE(?, unique_posts_seen),
        unique_posts_seen_7d = COALESCE(?, unique_posts_seen_7d),
        unique_posts_seen_30d = COALESCE(?, unique_posts_seen_30d),
        comments = COALESCE(?, comments),
        comments_7d = COALESCE(?, comments_7d),
        comments_30d = COALESCE(?, comments_30d),
        shares = COALESCE(?, shares),
        shares_7d = COALESCE(?, shares_7d),
        shares_30d = COALESCE(?, shares_30d),
        subscriptions_gifted = COALESCE(?, subscriptions_gifted),
        first_paid_date = COALESCE(?, first_paid_date),
        revenue = COALESCE(?, revenue),
        subscription_source_free = COALESCE(?, subscription_source_free, source),
        subscription_source_paid = COALESCE(?, subscription_source_paid),
        days_active_30d = COALESCE(?, days_active_30d),
        activity = COALESCE(?, activity),
        country = COALESCE(?, country),
        state_province = COALESCE(?, state_province),
        expiration_date = COALESCE(?, expiration_date),
        type = COALESCE(?, type),
        sections = COALESCE(?, sections)
      WHERE lower(email) = lower(?)
      `,
    )
    .bind(
      enrichedRecord.name,
      enrichedRecord.stripePlan,
      enrichedRecord.cancelDate,
      enrichedRecord.startDate,
      enrichedRecord.paidUpgradeDate,
      enrichedRecord.bestseller,
      enrichedRecord.emailsReceived6mo,
      enrichedRecord.emailsDropped6mo,
      enrichedRecord.numEmailsOpened,
      enrichedRecord.emailsOpened6mo,
      enrichedRecord.emailsOpened7d,
      enrichedRecord.emailsOpened30d,
      enrichedRecord.lastEmailOpen,
      enrichedRecord.linksClicked,
      enrichedRecord.lastClickedAt,
      enrichedRecord.uniqueEmailsSeen6mo,
      enrichedRecord.uniqueEmailsSeen7d,
      enrichedRecord.uniqueEmailsSeen30d,
      enrichedRecord.postViews,
      enrichedRecord.postViews7d,
      enrichedRecord.postViews30d,
      enrichedRecord.uniquePostsSeen,
      enrichedRecord.uniquePostsSeen7d,
      enrichedRecord.uniquePostsSeen30d,
      enrichedRecord.comments,
      enrichedRecord.comments7d,
      enrichedRecord.comments30d,
      enrichedRecord.shares,
      enrichedRecord.shares7d,
      enrichedRecord.shares30d,
      enrichedRecord.subscriptionsGifted,
      enrichedRecord.firstPaidDate,
      enrichedRecord.revenue,
      enrichedRecord.subscriptionSourceFree,
      enrichedRecord.subscriptionSourcePaid,
      enrichedRecord.daysActive30d,
      enrichedRecord.activity,
      enrichedRecord.country,
      enrichedRecord.stateProvince,
      enrichedRecord.expirationDate,
      enrichedRecord.type,
      enrichedRecord.sections,
      email,
    )
    .run();
}

async function handleStorefront(request: Request, env: Env, url: URL) {
  const token = String(env.FOURTH_WALL_API_KEY ?? env.FW_STOREFRONT_TOKEN ?? "").trim();
  if (!token) return errorResponse("Storefront not configured", 500);

  try {
    const requestedCollection = normalizeText(url.searchParams.get("collection"), 120);
    const [shopData, collectionsData] = await Promise.all([
      fetchFourthwallJson(token, "/v1/shop"),
      fetchFourthwallJson(token, "/v1/collections"),
    ]);

    const shop = shopData as { id?: string; name?: string; domain?: string; publicDomain?: string };
    const collections = ((collectionsData as { results?: unknown[] }).results ?? [])
      .map((raw) => raw as { name?: string; slug?: string })
      .filter((item) => item?.slug)
      .map((item) => ({
        name: String(item.name ?? item.slug ?? "Collection"),
        slug: String(item.slug ?? ""),
      }));
    const selectedCollection = requestedCollection || collections.find((entry) => entry.slug === "all")?.slug || collections[0]?.slug || "all";
    const productsData = await fetchFourthwallJson(token, `/v1/collections/${encodeURIComponent(selectedCollection)}/products`);
    const rawProducts = ((productsData as { results?: unknown[] }).results ?? []) as Array<{
      id?: string;
      name?: string;
      slug?: string;
      description?: string;
      images?: Array<{ url?: string; transformedUrl?: string }>;
      variants?: Array<{ unitPrice?: { value?: number; currency?: string } }>;
    }>;

    const response = ok({
      shop: {
        id: String(shop.id ?? ""),
        name: String(shop.name ?? "Store"),
        domain: String(shop.publicDomain ?? shop.domain ?? ""),
        url: normalizeDomain(String(shop.publicDomain ?? shop.domain ?? "")),
      },
      collection: selectedCollection,
      collections,
      products: rawProducts.map((product) => ({
        id: String(product.id ?? ""),
        name: String(product.name ?? "Product"),
        slug: String(product.slug ?? ""),
        description: String(product.description ?? ""),
        image: String(product.images?.[0]?.transformedUrl ?? product.images?.[0]?.url ?? ""),
        priceValue: typeof product.variants?.[0]?.unitPrice?.value === "number" ? product.variants?.[0]?.unitPrice?.value.toFixed(2) : "",
        priceCurrency: String(product.variants?.[0]?.unitPrice?.currency ?? ""),
      })),
    });
    return withCache(response, "public, max-age=300, s-maxage=300, stale-while-revalidate=600");
  } catch (error) {
    console.error("Storefront fetch failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return errorResponse("Storefront unavailable", 502);
  }
}

async function handleProjects(request: Request, env: Env) {
  const db = env.DB;
  if (!db?.prepare) return errorResponse("Projects list not configured", 500);

  const selectWithBuy = `
    SELECT
      project_slug,
      program_key,
      series_key,
      series_title,
      cluster_key,
      cluster_title,
      author,
      title,
      subtitle,
      publication_year,
      status,
      sort_order,
      notes,
      cover_image,
      popup_description,
      buy_url,
      completion_percent,
      published_at
    FROM oncoming_projects
    ORDER BY (published_at IS NULL) ASC, published_at ASC, sort_order ASC
  `;
  const selectWithBuyLegacyProgress = `
    SELECT
      project_slug,
      program_key,
      series_key,
      series_title,
      cluster_key,
      cluster_title,
      author,
      title,
      subtitle,
      publication_year,
      status,
      sort_order,
      notes,
      cover_image,
      popup_description,
      buy_url
    FROM oncoming_projects
    ORDER BY sort_order ASC
  `;
  const selectLegacy = `
    SELECT
      project_slug,
      program_key,
      series_key,
      series_title,
      cluster_key,
      cluster_title,
      author,
      title,
      subtitle,
      publication_year,
      status,
      sort_order,
      notes,
      cover_image,
      popup_description
    FROM oncoming_projects
    ORDER BY sort_order ASC
  `;

  try {
    let queryResult: { results?: Array<Record<string, unknown>> };
    try {
      queryResult = await db.prepare(selectWithBuy).bind().all<Record<string, unknown>>();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("no such column: completion_percent")) {
        try {
          const partial = await db.prepare(selectWithBuyLegacyProgress).bind().all<Record<string, unknown>>();
          queryResult = {
            results: (partial.results ?? []).map((project) => ({ ...project, completion_percent: 0, published_at: null })),
          };
        } catch (nestedError) {
          const nestedMessage = nestedError instanceof Error ? nestedError.message : String(nestedError);
          if (!nestedMessage.includes("no such column: buy_url")) throw nestedError;
          const legacy = await db.prepare(selectLegacy).bind().all<Record<string, unknown>>();
          queryResult = {
            results: (legacy.results ?? []).map((project) => ({ ...project, buy_url: null, completion_percent: 0, published_at: null })),
          };
        }
      } else if (message.includes("no such column: buy_url")) {
        const legacy = await db.prepare(selectLegacy).bind().all<Record<string, unknown>>();
        queryResult = {
          results: (legacy.results ?? []).map((project) => ({ ...project, buy_url: null, completion_percent: 0, published_at: null })),
        };
      } else {
        throw error;
      }
    }

    const projects = (Array.isArray(queryResult.results) ? queryResult.results : []).map((project) => {
      const rawPercent = Number(project.completion_percent ?? 0);
      const completionPercent = Number.isFinite(rawPercent)
        ? Math.max(0, Math.min(100, Math.round(rawPercent)))
        : 0;
      return {
        ...project,
        completion_percent: completionPercent,
      };
    });
    const seriesCount = new Map<string, { key: string; title: string; count: number }>();
    for (const project of projects) {
      const key = String(project.series_key ?? "");
      const existing = seriesCount.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        seriesCount.set(key, {
          key,
          title: String(project.series_title ?? key),
          count: 1,
        });
      }
    }

    const response = ok({
      program: { key: "master-canon-structure", title: "Master Canon Structure" },
      totals: { volumes: projects.length, series: seriesCount.size },
      series: Array.from(seriesCount.values()),
      projects,
    });
    return withCache(response, "public, max-age=300, s-maxage=300, stale-while-revalidate=600");
  } catch (error) {
    console.error("Projects query failed", {
      message: error instanceof Error ? error.message : String(error),
    });
    return errorResponse("Projects list unavailable", 500);
  }
}

function requireImportAuth(request: Request, env: Env) {
  const token = String(env.UPDATES_IMPORT_TOKEN ?? "").trim();
  const provided = String(request.headers.get("x-import-token") ?? "").trim();
  return Boolean(token && provided && token === provided);
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    try {
      if (request.method === "OPTIONS") {
        return withCors(request, new Response(null, { status: 204 }));
      }

      if (url.pathname === "/api/health" && request.method === "GET") {
        const dbConfigured = Boolean(env.DB?.prepare);
        let dbReachable = false;
        if (dbConfigured) {
          try {
            await env.DB!.prepare("SELECT 1").bind().first();
            dbReachable = true;
          } catch {
            dbReachable = false;
          }
        }
        return withCors(
          request,
          ok({
            service: "communications-worker",
            dbConfigured,
            dbReachable,
            resendConfigured: Boolean(String(env.RESEND_API_KEY ?? "").trim()),
            stripeConfigured: Boolean(String(env.STRIPE_SECRET_KEY ?? "").trim()),
            storefrontConfigured: Boolean(String(env.FOURTH_WALL_API_KEY ?? env.FW_STOREFRONT_TOKEN ?? "").trim()),
            importConfigured: Boolean(String(env.UPDATES_IMPORT_TOKEN ?? "").trim()),
            now: new Date().toISOString(),
          }),
        );
      }

      if (url.pathname === "/api/storefront" && request.method === "GET") {
        return withCors(request, await handleStorefront(request, env, url));
      }

      if (url.pathname === "/api/projects" && request.method === "GET") {
        return withCors(request, await handleProjects(request, env));
      }

      if (request.method !== "POST") {
        return withCors(request, errorResponse("Not found", 404));
      }

      const limit = await checkRateLimit(request, env);
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
      if (!body) return withCors(request, errorResponse("Invalid JSON", 400));

      if (url.pathname === "/api/updates/import") {
        if (!requireImportAuth(request, env)) {
          return withCors(request, errorResponse("Unauthorized", 401));
        }
        const db = env.DB;
        const fromEmail = normalizeText(body.email, 320);
        const source = normalizeNullableText(body.source, 80);
        if (!isProbablyEmail(fromEmail)) {
          return withCors(request, errorResponse("Missing fields", 400));
        }
        if (!db?.prepare) {
          return withCors(request, errorResponse("Updates list not configured", 500));
        }
        const userAgent = request.headers.get("user-agent") ?? "updates-import";
        const { canonicalEmail } = await upsertUpdatesSignup(db, fromEmail, source, userAgent);
        await applyUpdatesEnrichment(db, canonicalEmail, body);
        return withCors(request, ok({ imported: true }));
      }

      if (pickHoneypot(body)) {
        if (url.pathname === "/api/updates") {
          return withCors(request, ok({ alreadySignedUp: false }));
        }
        return withCors(request, ok({}));
      }

      const turnstileOk = await verifyTurnstile(request, env, pickTurnstileToken(body));
      if (!turnstileOk) {
        return withCors(request, errorResponse("Turnstile verification failed", 403));
      }

      if (url.pathname === "/api/updates") {
        const db = env.DB;
        const fromEmail = normalizeText(body.email, 320);
        const source = normalizeNullableText(body.source, 80);
        if (!isProbablyEmail(fromEmail)) {
          return withCors(request, errorResponse("Missing fields", 400));
        }
        if (!db?.prepare) {
          return withCors(request, errorResponse("Updates list not configured", 500));
        }
        const userAgent = request.headers.get("user-agent") ?? "";
        const { alreadySignedUp } = await upsertUpdatesSignup(db, fromEmail, source, userAgent);
        return withCors(request, ok({ alreadySignedUp }));
      }

      if (url.pathname === "/api/contact") {
        if (!env.RESEND_API_KEY || !env.FROM_EMAIL || !env.TO_EMAIL) {
          return withCors(request, errorResponse("Server not configured", 500));
        }
        const fromEmail = normalizeText(body.email, 320);
        const reason = normalizeText(body.reason, 120);
        const message = normalizeText(body.message, 6000);
        if (!isProbablyEmail(fromEmail) || !message) {
          return withCors(request, errorResponse("Missing fields", 400));
        }
        const id = refId("CONTACT");
        const editorEmailId = await sendEmail(env, {
          to: env.TO_EMAIL,
          subject: `St. Expedite Press — Contact${reason ? ` (${reason})` : ""} — ${id}`,
          text: ["Contact form submission", "", `Ref: ${id}`, reason ? `Reason: ${reason}` : null, `From: ${fromEmail}`, "", message].filter(Boolean).join("\n"),
          html: renderContactEditorHtml({ id, reason, fromEmail, message }),
          replyTo: fromEmail,
        });
        const receiptEmailId = await sendEmail(env, {
          to: fromEmail,
          subject: `Received — ${id}`,
          text: [
            "Your message to St. Expedite Press has been received.",
            "",
            `Reference: ${id}`,
            "If you need to add detail, reply to this email and include the reference in your message.",
            "",
            "— St. Expedite Press",
          ].join("\n"),
          html: renderReceiptHtml({ id, heading: "Contact Message Received", detail: "Your message to St. Expedite Press has been received." }),
          replyTo: env.TO_EMAIL,
        });
        await logSubmission(env.DB, {
          id,
          type: "contact",
          email: fromEmail,
          reason: reason || null,
          message,
          editorEmailId,
          receiptEmailId,
        });
        return withCors(request, ok({ id }));
      }

      if (url.pathname === "/api/submit") {
        if (!env.RESEND_API_KEY || !env.FROM_EMAIL || !env.TO_EMAIL) {
          return withCors(request, errorResponse("Server not configured", 500));
        }
        const fromEmail = normalizeText(body.email, 320);
        const note = normalizeText(body.note, 6000);
        if (!isProbablyEmail(fromEmail)) {
          return withCors(request, errorResponse("Missing fields", 400));
        }
        const id = refId("SUBMIT");
        const editorEmailId = await sendEmail(env, {
          to: env.TO_EMAIL,
          subject: `St. Expedite Press — Submission — ${id}`,
          text: ["Submission / inquiry", "", `Ref: ${id}`, `From: ${fromEmail}`, "", note || "(no note)"].join("\n"),
          html: renderSubmitEditorHtml({ id, fromEmail, note }),
          replyTo: fromEmail,
        });
        const receiptEmailId = await sendEmail(env, {
          to: fromEmail,
          subject: `Received — ${id}`,
          text: [
            "Your submission inquiry has been received.",
            "",
            `Reference: ${id}`,
            "If you need to send attachments, reply to this email and include the reference in your subject line.",
            "",
            "— St. Expedite Press",
          ].join("\n"),
          html: renderReceiptHtml({ id, heading: "Submission Inquiry Received", detail: "Your submission inquiry has been received." }),
          replyTo: env.TO_EMAIL,
        });
        await logSubmission(env.DB, {
          id,
          type: "submit",
          email: fromEmail,
          reason: null,
          message: note || null,
          editorEmailId,
          receiptEmailId,
        });
        return withCors(request, ok({ id }));
      }

      if (url.pathname === "/api/donate/session") {
        const amountCents = parseDonationAmountCents(body);
        if (amountCents === null) {
          return withCors(request, errorResponse("Invalid donation amount", 400));
        }
        if (amountCents < DONATION_MIN_CENTS) {
          return withCors(request, errorResponse("Donation amount below minimum", 400));
        }
        if (amountCents > DONATION_MAX_CENTS) {
          return withCors(request, errorResponse("Donation amount above maximum", 400));
        }
        if (!String(env.STRIPE_SECRET_KEY ?? "").trim()) {
          return withCors(request, errorResponse("Stripe not configured", 500));
        }

        const session = await createStripeCheckoutSession(env, { amountCents });
        if (!session.url) {
          return withCors(request, errorResponse("Stripe session unavailable", 502));
        }

        return withCors(request, ok({ amountCents, sessionId: session.id, url: session.url }));
      }

      if (url.pathname === "/api/updates/unsubscribe") {
        const db = env.DB;
        const fromEmail = normalizeText(body.email, 320);
        if (!isProbablyEmail(fromEmail)) {
          return withCors(request, errorResponse("Missing fields", 400));
        }
        if (!db?.prepare) {
          return withCors(request, errorResponse("Updates list not configured", 500));
        }
        await db
          .prepare(`UPDATE updates_signups SET unsubscribed_at = datetime('now') WHERE lower(email) = lower(?)`)
          .bind(fromEmail)
          .run();
        return withCors(request, ok({ unsubscribed: true }));
      }

      return withCors(request, errorResponse("Not found", 404));
    } catch (error) {
      console.error("Unhandled worker error", {
        path: url.pathname,
        method: request.method,
        message: error instanceof Error ? error.message : String(error),
      });
      return withCors(request, errorResponse("Internal server error", 500));
    }
  },
};

export const __testing = {
  clearRateLimitState() {
    // No-op: in-memory rate-limit fallback removed; D1 is authoritative.
  },
};

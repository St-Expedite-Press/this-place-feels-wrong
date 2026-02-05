type JsonRecord = Record<string, unknown>;

type Env = {
  RESEND_API_KEY: string;
  FROM_EMAIL: string;
  TO_EMAIL: string;
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
  headers.set("access-control-allow-methods", "POST, OPTIONS");
  headers.set("access-control-allow-headers", "content-type");
  headers.set("access-control-max-age", "86400");

  return new Response(response.body, { ...response, headers });
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

async function sendEmail(env: Env, params: { to: string; subject: string; text: string; replyTo?: string }) {
  const payload: Record<string, unknown> = {
    from: env.FROM_EMAIL,
    to: [params.to],
    subject: params.subject,
    text: params.text,
  };

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

function pickHoneypot(body: JsonRecord | null) {
  const raw = body?.website ?? body?.company ?? body?.hp ?? "";
  return String(raw ?? "").trim();
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return withCors(request, new Response(null, { status: 204 }));
    }

    if (request.method !== "POST") {
      return withCors(request, json({ ok: false, error: "Not found" }, { status: 404 }));
    }

    const body = await parseJson(request);
    if (!body) {
      return withCors(request, json({ ok: false, error: "Invalid JSON" }, { status: 400 }));
    }

    if (!env.RESEND_API_KEY || !env.FROM_EMAIL || !env.TO_EMAIL) {
      return withCors(
        request,
        json({ ok: false, error: "Server not configured" }, { status: 500 }),
      );
    }

    // Basic bot honeypot: if filled, accept but do nothing.
    if (pickHoneypot(body)) {
      return withCors(request, json({ ok: true }, { status: 200 }));
    }

    if (url.pathname === "/api/contact") {
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

      await sendEmail(env, { to: env.TO_EMAIL, subject, text: editorText, replyTo: fromEmail });

      const receiptSubject = `Received — ${id}`;
      const receiptText = [
        "Your message to St. Expedite Press has been received.",
        "",
        `Reference: ${id}`,
        "If you need to add detail, reply to this email and include the reference in your message.",
        "",
        "— St. Expedite Press",
      ].join("\n");

      await sendEmail(env, { to: fromEmail, subject: receiptSubject, text: receiptText, replyTo: env.TO_EMAIL });

      return withCors(request, json({ ok: true, id }, { status: 200 }));
    }

    if (url.pathname === "/api/submit") {
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

      await sendEmail(env, { to: env.TO_EMAIL, subject, text: editorText, replyTo: fromEmail });

      const receiptSubject = `Received — ${id}`;
      const receiptText = [
        "Your submission inquiry has been received.",
        "",
        `Reference: ${id}`,
        "If you need to send attachments, reply to this email and include the reference in your subject line.",
        "",
        "— St. Expedite Press",
      ].join("\n");

      await sendEmail(env, { to: fromEmail, subject: receiptSubject, text: receiptText, replyTo: env.TO_EMAIL });

      return withCors(request, json({ ok: true, id }, { status: 200 }));
    }

    return withCors(request, json({ ok: false, error: "Not found" }, { status: 404 }));
  },
};

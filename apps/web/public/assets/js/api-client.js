export class ApiError extends Error {
  constructor(message, { status = 500, data = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function readApiOriginOverride() {
  const meta = document.querySelector('meta[name="sep-api-origin"]');
  const content = meta?.getAttribute("content")?.trim();
  return content || "";
}

function resolveRequestUrl(url) {
  if (typeof url !== "string") return url;
  if (!url.startsWith("/api/")) return url;

  const override = readApiOriginOverride();
  if (override) return `${override.replace(/\/$/, "")}${url}`;

  const { protocol, hostname, port } = window.location;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  const localProtocol = protocol === "file:" ? "http:" : protocol;

  if (protocol === "file:") {
    return `http://127.0.0.1:8787${url}`;
  }

  if (isLocalHost && port !== "8787") {
    return `${localProtocol}//${hostname}:8787${url}`;
  }

  return url;
}

export async function requestJson(url, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    timeout = 10_000,
    signal,
    cache,
  } = options;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeout);
  const mergedSignal = signal ?? controller.signal;
  const init = { method, headers: { ...headers }, signal: mergedSignal };

  if (cache) init.cache = cache;

  if (body !== undefined) {
    init.headers["content-type"] = "application/json";
    init.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(resolveRequestUrl(url), init);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiError(
        typeof data?.error === "string" ? data.error : `Request failed (${response.status})`,
        { status: response.status, data },
      );
    }
    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new ApiError("Request timed out", { status: 408 });
    }
    if (error instanceof ApiError) throw error;
    throw new ApiError(error instanceof Error ? error.message : "Request failed");
  } finally {
    window.clearTimeout(timer);
  }
}

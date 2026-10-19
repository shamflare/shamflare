"use client";

import type { ApiErrorBody } from "./types";

/**
 * Browser-side API access. Requests go to the same origin (`/api/v1/...`), which
 * the reverse proxy (or Next.js rewrites in development) forwards to Django.
 * Authentication uses Django's HttpOnly session cookie; unsafe methods carry
 * the CSRF token from the `csrftoken` cookie in the `X-CSRFToken` header.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields: Record<string, string[]>;

  constructor(status: number, body: ApiErrorBody["error"] | null) {
    super(body?.message ?? `Request failed with status ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = body?.code ?? (status === 0 ? "network_error" : "server_error");
    this.fields = body?.fields ?? {};
  }
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function readCookie(name: string): string | null {
  const match = document.cookie.split("; ").find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

let csrfRequest: Promise<string> | null = null;

/** Returns the CSRF token, asking Django to set the cookie first if needed. */
export async function ensureCsrfToken(): Promise<string> {
  const existing = readCookie("csrftoken");
  if (existing) return existing;
  csrfRequest ??= fetch("/api/v1/auth/csrf/", { credentials: "same-origin" })
    .then(async (response) => {
      const body = (await response.json().catch(() => null)) as { csrfToken?: string } | null;
      return readCookie("csrftoken") ?? body?.csrfToken ?? "";
    })
    .finally(() => {
      csrfRequest = null;
    });
  return csrfRequest;
}

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
};

export function apiUrl(path: string, query?: RequestOptions["query"]): string {
  const url = new URL(`/api/v1/${path.replace(/^\//, "")}`, window.location.origin);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url.pathname + url.search;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const headers: Record<string, string> = { Accept: "application/json" };
  let body: BodyInit | undefined;

  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }
  if (!SAFE_METHODS.has(method)) {
    headers["X-CSRFToken"] = await ensureCsrfToken();
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(path, options.query), {
      method,
      headers,
      body,
      credentials: "same-origin",
      signal: options.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError(0, null);
  }

  if (response.status === 204) return undefined as T;

  const payload = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const errorBody =
      payload && typeof payload === "object" && "error" in payload ? (payload as ApiErrorBody).error : null;
    throw new ApiError(response.status, errorBody);
  }
  return payload as T;
}

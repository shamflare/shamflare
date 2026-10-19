"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiError, apiRequest, type RequestOptions } from "@/lib/api/client";

export type Resource<T> = {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
  reload: () => void;
  setData: (value: T) => void;
};

type Settled<T> = { key: string; data: T | null; error: ApiError | null };

/**
 * Loads an admin API resource; re-fetches when `path` or `query` change.
 * While a new request is in flight the previous data stays available
 * (so lists can dim instead of flashing empty) and `loading` is true.
 */
export function useResource<T>(path: string | null, query?: RequestOptions["query"]): Resource<T> {
  const [version, setVersion] = useState(0);
  const queryJson = JSON.stringify(query ?? {});
  const requestKey = `${path}::${queryJson}::${version}`;
  const [settled, setSettled] = useState<Settled<T>>({ key: "", data: null, error: null });

  useEffect(() => {
    if (path === null) return;
    const controller = new AbortController();
    apiRequest<T>(path, { query: JSON.parse(queryJson) as RequestOptions["query"], signal: controller.signal })
      .then((data) => setSettled({ key: requestKey, data, error: null }))
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSettled((previous) => ({
          key: requestKey,
          data: previous.data,
          error: err instanceof ApiError ? err : new ApiError(0, null),
        }));
      });
    return () => controller.abort();
  }, [path, queryJson, requestKey]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const setData = useCallback((data: T) => setSettled((previous) => ({ ...previous, data, error: null })), []);

  return {
    data: settled.data,
    error: settled.error,
    loading: path !== null && settled.key !== requestKey,
    reload,
    setData,
  };
}

/** Human-readable message for a failed admin request. */
export function describeError(error: unknown): string {
  if (!(error instanceof ApiError)) return "Something went wrong.";
  if (error.status === 0) return "The server could not be reached. Check your connection and try again.";
  if (error.status === 401 || error.status === 403) return "Your session has expired or you do not have permission. Sign in again.";
  if (error.status === 404) return "This item no longer exists.";
  if (error.status === 429) return "Too many requests. Please wait a moment and try again.";
  return error.message || "The request failed.";
}

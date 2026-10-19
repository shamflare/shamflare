"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ApiError, apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/Button";
import { Field, Notice, inputClass } from "./ui";

/** Only allow redirects back into the dashboard (prevents open redirects). */
function safeNext(value: string | null): string {
  return value && value.startsWith("/admin") && !value.startsWith("//") ? value : "/admin";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError("");
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    setSubmitting(true);
    try {
      await apiRequest("auth/login/", { method: "POST", body: { username: username.trim(), password } });
      router.replace(safeNext(searchParams.get("next")));
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) setError("Too many sign-in attempts. Please wait before trying again.");
      else if (err instanceof ApiError && err.status === 0) setError("The server could not be reached.");
      else if (err instanceof ApiError && err.status === 400) setError("The username or password is incorrect, or the account has no dashboard access.");
      else if (err instanceof ApiError && err.status === 403)
        setError("The security check failed (CSRF). Reload the page and try again; if it persists, check CSRF_TRUSTED_ORIGINS on the server.");
      else setError("Sign-in failed. Please try again.");
      setPassword("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 space-y-5" aria-busy={submitting}>
      {error ? <Notice kind="error">{error}</Notice> : null}
      <Field label="Username">
        {(props) => (
          <input {...props} autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} autoFocus />
        )}
      </Field>
      <Field label="Password">
        {(props) => (
          <input
            {...props}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
        )}
      </Field>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

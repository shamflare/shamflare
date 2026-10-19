import type { Metadata } from "next";
import { Suspense } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="bg-grid relative grid min-h-dvh place-items-center px-4 py-16">
      <div aria-hidden className="absolute top-0 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-accent-2/10 blur-3xl" />
      <main className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Wordmark size="lg" id="sf-mark-login" />
        </div>
        <div className="rounded-[var(--radius-xl)] border border-line bg-surface p-7 shadow-[var(--shadow-card)]">
          <h1 className="text-xl font-semibold">Sign in to the dashboard</h1>
          <p className="mt-1.5 text-sm text-muted">Administrator access only.</p>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

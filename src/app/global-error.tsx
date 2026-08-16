"use client";

import "./globals.css";

/**
 * Catches failures thrown by the root layout itself (for example a missing
 * AUTH_SECRET), where the normal error boundary cannot render.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <h1 className="text-xl font-semibold">This deployment is misconfigured</h1>
          <p className="muted mt-2">
            The server could not start handling the request. Check the database
            connection string and auth secret in the deployment&apos;s
            environment variables.
          </p>
          <p className="muted mt-2">
            Open{" "}
            <a className="underline" href="/api/health">
              /api/health
            </a>{" "}
            for a diagnosis.
          </p>
          {error.digest ? (
            <p className="muted mt-2 text-xs">Error digest: {error.digest}</p>
          ) : null}
          <button type="button" className="btn-primary mt-4" onClick={reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

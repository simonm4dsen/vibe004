"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="card mx-auto max-w-xl text-center">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="muted mt-2">
        The server could not finish this request. This is almost always a
        configuration problem with the database connection or the auth secret.
      </p>
      <p className="muted mt-2">
        Open{" "}
        <a className="underline" href="/api/health">
          /api/health
        </a>{" "}
        for a diagnosis of what is misconfigured.
      </p>
      {error.digest ? (
        <p className="muted mt-2 text-xs">Error digest: {error.digest}</p>
      ) : null}
      <button type="button" className="btn-primary mt-4" onClick={reset}>
        Try again
      </button>
    </div>
  );
}

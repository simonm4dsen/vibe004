export type ActionState = {
  error?: string;
  /** Bumped on every successful mutation so clients can react (e.g. reset a form). */
  ok?: number;
};

export const emptyActionState: ActionState = {};

export function errorState(message: string): ActionState {
  return { error: message };
}

export function successState(): ActionState {
  return { ok: Date.now() };
}

/** Next.js implements redirect() and notFound() by throwing; never swallow those. */
function isControlFlow(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    ((error as { digest: string }).digest.startsWith("NEXT_REDIRECT") ||
      (error as { digest: string }).digest === "NEXT_NOT_FOUND")
  );
}

/**
 * Runs an action and turns unexpected failures (a misconfigured database being
 * the usual culprit in a fresh deployment) into a message shown in the form
 * instead of a blank "server-side exception" page. The underlying error is
 * logged so it is visible in the hosting provider's runtime logs.
 */
export async function guardAction(
  run: () => Promise<ActionState>,
): Promise<ActionState> {
  try {
    return await run();
  } catch (error) {
    if (isControlFlow(error)) throw error;

    console.error("[action failed]", error);

    return errorState(describeFailure(error));
  }
}

export function describeFailure(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (/AUTH_SECRET/i.test(message)) {
    return "The server is missing its AUTH_SECRET setting. Add it to the deployment's environment variables and redeploy.";
  }

  if (/connection string|DATABASE_URL/i.test(message)) {
    return "The server has no usable database connection string. Check DATABASE_URL in the deployment's environment variables and redeploy.";
  }

  if (/relation .* does not exist|does not exist/i.test(message)) {
    return "The database is reachable but the tables are missing. Run the database migrations against it (npm run db:migrate).";
  }

  if (/password authentication failed|role .* does not exist/i.test(message)) {
    return "The database rejected the credentials in DATABASE_URL. Check the connection string, then redeploy.";
  }

  if (/ENOTFOUND|EAI_AGAIN|ECONNREFUSED|ETIMEDOUT|fetch failed/i.test(message)) {
    return "The server could not reach the database. Check that the database is running and that DATABASE_URL points at it.";
  }

  return "Something went wrong on the server. Check /api/health for a diagnosis.";
}

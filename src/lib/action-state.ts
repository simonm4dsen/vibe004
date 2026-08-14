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

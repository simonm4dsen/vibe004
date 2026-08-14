"use client";

import { useActionState, useState } from "react";

import { loginAction, registerAction } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { emptyActionState } from "@/lib/action-state";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const [state, formAction] = useActionState(
    isRegister ? registerAction : loginAction,
    emptyActionState,
  );
  // Controlled so the address survives a rejected submit; React resets
  // uncontrolled forms once the action completes.
  const [email, setEmail] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      {state.error ? <p className="form-error">{state.error}</p> : null}

      <div>
        <label className="label" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="input"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          required
          minLength={isRegister ? 8 : undefined}
          className="input"
          placeholder={isRegister ? "At least 8 characters" : "••••••••"}
        />
      </div>

      {isRegister ? (
        <div>
          <label className="label" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            className="input"
          />
        </div>
      ) : null}

      <SubmitButton
        pendingLabel={isRegister ? "Creating account…" : "Signing in…"}
        className="btn-primary w-full"
      >
        {isRegister ? "Create account" : "Sign in"}
      </SubmitButton>
    </form>
  );
}

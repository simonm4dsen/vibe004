"use client";

import { useFormStatus } from "react-dom";

import { signOutAction } from "@/app/actions/auth";

function Button() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn-secondary" disabled={pending}>
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <Button />
    </form>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Sign in · Shared Group Calendar" };

export default async function LoginPage() {
  if (await getCurrentUser()) {
    redirect("/groups");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="mb-1 text-xl font-semibold">Sign in</h1>
        <p className="muted mb-5">Welcome back.</p>
        <AuthForm mode="login" />
      </div>
      <p className="muted mt-4 text-center">
        No account yet?{" "}
        <Link href="/register" className="font-medium text-neutral-900 hover:underline dark:text-neutral-100">
          Create one
        </Link>
      </p>
    </div>
  );
}

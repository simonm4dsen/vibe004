import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Create account · Shared Group Calendar" };

export default async function RegisterPage() {
  if (await getCurrentUser()) {
    redirect("/groups");
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="mb-1 text-xl font-semibold">Create your account</h1>
        <p className="muted mb-5">
          One account, as many calendar groups as you like.
        </p>
        <AuthForm mode="register" />
      </div>
      <p className="muted mt-4 text-center">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-neutral-900 hover:underline dark:text-neutral-100">
          Sign in
        </Link>
      </p>
    </div>
  );
}

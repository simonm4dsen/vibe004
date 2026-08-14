import type { Metadata } from "next";
import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

import "./globals.css";

export const metadata: Metadata = {
  title: "Shared Group Calendar",
  description:
    "Share your upcoming appointments with a group of friends or your partner.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-black/10 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/30">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              <span aria-hidden>🗓️</span> Shared Calendar
            </Link>
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/groups" className="text-sm hover:underline">
                  My groups
                </Link>
                <span className="hidden text-sm text-neutral-500 sm:inline">
                  {user.email}
                </span>
                <SignOutButton />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm hover:underline">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary">
                  Create account
                </Link>
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

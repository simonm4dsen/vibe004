import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { getCurrentUser } from "@/lib/auth";

const features = [
  {
    title: "Create a group",
    body: "Pick a unique lowercase group name and a shared password to hand out.",
  },
  {
    title: "Everyone joins",
    body: "Friends enter that name and password, then choose their own display name.",
  },
  {
    title: "See the weeks ahead",
    body: "Everyone adds their plans and you get one shared view of what's coming up.",
  },
];

export default async function HomePage() {
  if (await getCurrentUser()) {
    redirect("/groups");
  }

  return (
    <div className="space-y-10">
      <section className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Share what you have planned
        </h1>
        <p className="muted mx-auto mt-3 max-w-xl text-base">
          A tiny shared calendar for a group of friends or a couple. Add your own
          appointments and get an overview of everyone&apos;s next few weeks.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/register" className="btn-primary">
            Create account
          </Link>
          <Link href="/login" className="btn-secondary">
            Sign in
          </Link>
        </div>
      </section>

      <section>
        <ol className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {features.map((feature, index) => (
            <li key={feature.title} className="relative flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 text-sm font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
                  {index + 1}
                </span>
                <h2 className="font-medium">{feature.title}</h2>
              </div>
              <p className="muted">{feature.body}</p>
              {index < features.length - 1 ? (
                <ChevronRight
                  aria-hidden
                  className="pointer-events-none absolute top-2 right-[-1.25rem] hidden h-5 w-5 text-neutral-300 sm:block dark:text-neutral-700"
                />
              ) : null}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

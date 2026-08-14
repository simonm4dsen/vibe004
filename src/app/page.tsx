import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

const features = [
  {
    title: "Create a group",
    body: "Pick a unique lowercase group name and a shared password to hand out.",
  },
  {
    title: "Everyone joins",
    body: "Friends join with the group name and password, then choose their display name.",
  },
  {
    title: "See the weeks ahead",
    body: "One list of upcoming plans plus a week and month calendar per member.",
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
            Get started
          </Link>
          <Link href="/login" className="btn-secondary">
            Sign in
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="card">
            <h2 className="mb-1 font-medium">{feature.title}</h2>
            <p className="muted">{feature.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

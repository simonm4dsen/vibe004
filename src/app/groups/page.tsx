import Link from "next/link";

import { GroupForms } from "@/components/group-forms";
import { requireUser } from "@/lib/auth";
import { getUserGroups } from "@/lib/data";

export const metadata = { title: "My groups · Shared Group Calendar" };

export default async function GroupsPage() {
  const user = await requireUser();
  const groups = await getUserGroups(user.id);
  const suggestedName = user.email.split("@")[0] ?? "";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <section>
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">My groups</h1>

        {groups.length === 0 ? (
          <div className="card">
            <p className="muted">
              You are not in any group yet. Join one with a group name and password,
              or create your own and share the details with your people.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {groups.map((group) => (
              <li key={group.id}>
                <Link
                  href={`/groups/${group.name}`}
                  className="card flex items-center justify-between transition hover:border-indigo-400"
                >
                  <span>
                    <span className="block font-medium">{group.name}</span>
                    <span className="muted">
                      You are “{group.displayName}” · {group.memberCount}{" "}
                      {group.memberCount === 1 ? "member" : "members"}
                    </span>
                  </span>
                  <span aria-hidden className="text-neutral-400">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold tracking-tight">
          Join or create
        </h2>
        <GroupForms defaultDisplayName={suggestedName} />
      </section>
    </div>
  );
}

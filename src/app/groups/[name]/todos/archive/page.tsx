import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ArchivedTodoList } from "@/components/archived-todo-list";
import { requireUser } from "@/lib/auth";
import { getGroupArchivedTodos, getGroupContext } from "@/lib/data";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { name } = await params;
  return { title: `Archived to-dos · ${name}` };
}

export default async function ArchivedTodosPage({ params }: PageProps) {
  const { name } = await params;
  const user = await requireUser();
  const context = await getGroupContext(user.id, name);

  if (!context) {
    notFound();
  }

  const archived = await getGroupArchivedTodos(context.group.id, context.membership.id);

  return (
    <div className="space-y-8">
      <header>
        <Link
          href={`/groups/${context.group.name}`}
          className="muted inline-flex items-center gap-1 hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to {context.group.name}
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Archived to-do items</h1>
        <p className="muted">Completed items live here until restored.</p>
      </header>

      <section className="card">
        <ArchivedTodoList groupName={context.group.name} items={archived} />
      </section>
    </div>
  );
}

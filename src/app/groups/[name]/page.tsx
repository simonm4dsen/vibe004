import Link from "next/link";
import { notFound } from "next/navigation";

import { AppointmentForm } from "@/components/appointment-form";
import { CalendarView } from "@/components/calendar-view";
import { TodoForm } from "@/components/todo-form";
import { TodoList } from "@/components/todo-list";
import { UpcomingList } from "@/components/upcoming-list";
import { requireUser } from "@/lib/auth";
import {
  getGroupAppointments,
  getGroupContext,
  getGroupMembers,
  getGroupTodos,
} from "@/lib/data";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: PageProps) {
  const { name } = await params;
  return { title: `${name} · Shared Group Calendar` };
}

export default async function GroupPage({ params }: PageProps) {
  const { name } = await params;
  const user = await requireUser();
  const context = await getGroupContext(user.id, name);

  if (!context) {
    notFound();
  }

  // Loaded a little into the past so the calendar can be navigated backwards.
  const since = new Date();
  since.setDate(since.getDate() - 90);

  const [members, appointments, todos] = await Promise.all([
    getGroupMembers(context.group.id, context.membership.id),
    getGroupAppointments(context.group.id, context.membership.id, since),
    getGroupTodos(context.group.id, context.membership.id),
  ]);

  const memberIds = members.map((member) => member.id);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/groups" className="muted hover:underline">
            ← All groups
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">
            {context.group.name}
          </h1>
          <p className="muted">
            You are “{context.membership.displayName}” · {members.length}{" "}
            {members.length === 1 ? "member" : "members"}
          </p>
        </div>
      </header>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Add an appointment</h2>
        <AppointmentForm groupName={context.group.name} />
      </section>

      <section className="card">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">To-do list</h2>
          <Link
            href={`/groups/${context.group.name}/todos/archive`}
            className="muted hover:underline"
          >
            View archived items →
          </Link>
        </div>
        <div className="mb-4">
          <TodoForm groupName={context.group.name} />
        </div>
        <TodoList groupName={context.group.name} items={todos} />
      </section>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Calendar</h2>
        <CalendarView appointments={appointments} members={members} />
      </section>

      <section className="card">
        <h2 className="mb-4 text-lg font-semibold">Upcoming</h2>
        <UpcomingList
          groupName={context.group.name}
          appointments={appointments}
          memberIds={memberIds}
        />
      </section>
    </div>
  );
}

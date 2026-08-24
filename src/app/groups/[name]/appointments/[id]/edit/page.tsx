import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AppointmentForm } from "@/components/appointment-form";
import { requireUser } from "@/lib/auth";
import { getGroupContext, getOwnAppointment } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit appointment · Shared Group Calendar" };

type PageProps = { params: Promise<{ name: string; id: string }> };

export default async function EditAppointmentPage({ params }: PageProps) {
  const { name, id } = await params;
  const user = await requireUser();
  const context = await getGroupContext(user.id, name);

  if (!context) {
    notFound();
  }

  const appointment = await getOwnAppointment(id, context.membership.id);

  if (!appointment) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link
        href={`/groups/${context.group.name}`}
        className="muted inline-flex items-center gap-1 hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Back to {context.group.name}
      </Link>
      <div className="card">
        <h1 className="mb-4 text-lg font-semibold">Edit appointment</h1>
        <AppointmentForm
          groupName={context.group.name}
          appointment={{
            id: appointment.id,
            title: appointment.title,
            startsAt: appointment.startsAt.toISOString(),
            endsAt: appointment.endsAt.toISOString(),
          }}
        />
      </div>
    </div>
  );
}

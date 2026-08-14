"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { appointments } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { errorState, successState, type ActionState } from "@/lib/action-state";
import { getGroupContext } from "@/lib/data";
import { appointmentSchema, firstError, groupNameSchema } from "@/lib/validation";

async function contextFor(formData: FormData) {
  const user = await requireUser();
  const parsedName = groupNameSchema.safeParse(formData.get("groupName"));

  if (!parsedName.success) return null;

  const context = await getGroupContext(user.id, parsedName.data);
  if (!context) return null;

  return context;
}

export async function createAppointmentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await contextFor(formData);

  if (!context) {
    return errorState("You are not a member of that group");
  }

  const parsed = appointmentSchema.safeParse({
    title: formData.get("title"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });

  if (!parsed.success) {
    return errorState(firstError(parsed.error));
  }

  await db.insert(appointments).values({
    groupId: context.group.id,
    memberId: context.membership.id,
    title: parsed.data.title,
    startsAt: new Date(parsed.data.startsAt),
    endsAt: new Date(parsed.data.endsAt),
  });

  revalidatePath(`/groups/${context.group.name}`);
  return successState();
}

export async function updateAppointmentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await contextFor(formData);

  if (!context) {
    return errorState("You are not a member of that group");
  }

  const appointmentId = String(formData.get("appointmentId") ?? "");

  const parsed = appointmentSchema.safeParse({
    title: formData.get("title"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  });

  if (!parsed.success) {
    return errorState(firstError(parsed.error));
  }

  const updated = await db
    .update(appointments)
    .set({
      title: parsed.data.title,
      startsAt: new Date(parsed.data.startsAt),
      endsAt: new Date(parsed.data.endsAt),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(appointments.id, appointmentId),
        eq(appointments.memberId, context.membership.id),
      ),
    )
    .returning({ id: appointments.id });

  if (updated.length === 0) {
    return errorState("You can only edit your own appointments");
  }

  revalidatePath(`/groups/${context.group.name}`);
  redirect(`/groups/${context.group.name}`);
}

export async function deleteAppointmentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await contextFor(formData);

  if (!context) {
    return errorState("You are not a member of that group");
  }

  const appointmentId = String(formData.get("appointmentId") ?? "");

  const deleted = await db
    .delete(appointments)
    .where(
      and(
        eq(appointments.id, appointmentId),
        eq(appointments.memberId, context.membership.id),
      ),
    )
    .returning({ id: appointments.id });

  if (deleted.length === 0) {
    return errorState("You can only delete your own appointments");
  }

  revalidatePath(`/groups/${context.group.name}`);
  return successState();
}

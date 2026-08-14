"use server";

import { and, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { groups, memberships } from "@/db/schema";
import { hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { errorState, type ActionState } from "@/lib/action-state";
import {
  createGroupSchema,
  firstError,
  joinGroupSchema,
} from "@/lib/validation";

async function displayNameTaken(
  groupId: string,
  displayName: string,
): Promise<boolean> {
  const [row] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(
        eq(memberships.groupId, groupId),
        sql`lower(${memberships.displayName}) = ${displayName.toLowerCase()}`,
      ),
    )
    .limit(1);

  return Boolean(row);
}

export async function createGroupAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = createGroupSchema.safeParse({
    name: formData.get("name"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return errorState(firstError(parsed.error));
  }

  const { name, password, displayName } = parsed.data;

  const [existing] = await db
    .select({ id: groups.id })
    .from(groups)
    .where(eq(groups.name, name))
    .limit(1);

  if (existing) {
    return errorState(`The group name "${name}" is already taken`);
  }

  const [group] = await db
    .insert(groups)
    .values({
      name,
      passwordHash: await hashPassword(password),
      createdBy: user.id,
    })
    .returning({ id: groups.id });

  await db.insert(memberships).values({
    groupId: group.id,
    userId: user.id,
    displayName,
  });

  redirect(`/groups/${name}`);
}

export async function joinGroupAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = joinGroupSchema.safeParse({
    name: formData.get("name"),
    password: formData.get("password"),
    displayName: formData.get("displayName"),
  });

  if (!parsed.success) {
    return errorState(firstError(parsed.error));
  }

  const { name, password, displayName } = parsed.data;

  const [group] = await db
    .select({ id: groups.id, passwordHash: groups.passwordHash })
    .from(groups)
    .where(eq(groups.name, name))
    .limit(1);

  if (!group || !(await verifyPassword(password, group.passwordHash))) {
    return errorState("Unknown group name or wrong group password");
  }

  const [alreadyMember] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(
      and(eq(memberships.groupId, group.id), eq(memberships.userId, user.id)),
    )
    .limit(1);

  if (alreadyMember) {
    redirect(`/groups/${name}`);
  }

  if (await displayNameTaken(group.id, displayName)) {
    return errorState(
      `"${displayName}" is already used in that group — pick another display name`,
    );
  }

  await db.insert(memberships).values({
    groupId: group.id,
    userId: user.id,
    displayName,
  });

  redirect(`/groups/${name}`);
}

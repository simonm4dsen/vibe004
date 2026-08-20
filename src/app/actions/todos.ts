"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { todoItems } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import {
  errorState,
  guardAction,
  successState,
  type ActionState,
} from "@/lib/action-state";
import { getGroupContext } from "@/lib/data";
import { firstError, groupNameSchema, todoSchema } from "@/lib/validation";

async function contextFor(formData: FormData) {
  const user = await requireUser();
  const parsedName = groupNameSchema.safeParse(formData.get("groupName"));

  if (!parsedName.success) return null;

  const context = await getGroupContext(user.id, parsedName.data);
  if (!context) return null;

  return context;
}

export async function createTodoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return guardAction(async () => {
    const context = await contextFor(formData);

    if (!context) {
      return errorState("You are not a member of that group");
    }

    const parsed = todoSchema.safeParse({ title: formData.get("title") });

    if (!parsed.success) {
      return errorState(firstError(parsed.error));
    }

    await db.insert(todoItems).values({
      groupId: context.group.id,
      memberId: context.membership.id,
      title: parsed.data.title,
    });

    revalidatePath(`/groups/${context.group.name}`);
    return successState();
  });
}

export async function completeTodoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return guardAction(async () => {
    const context = await contextFor(formData);

    if (!context) {
      return errorState("You are not a member of that group");
    }

    const todoId = String(formData.get("todoId") ?? "");

    // Any member of the group may complete any item — it's a shared list,
    // unlike appointments which are owner-only.
    const updated = await db
      .update(todoItems)
      .set({ completedAt: new Date() })
      .where(and(eq(todoItems.id, todoId), eq(todoItems.groupId, context.group.id)))
      .returning({ id: todoItems.id });

    if (updated.length === 0) {
      return errorState("That item no longer exists");
    }

    revalidatePath(`/groups/${context.group.name}`);
    revalidatePath(`/groups/${context.group.name}/todos/archive`);
    return successState();
  });
}

export async function restoreTodoAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  return guardAction(async () => {
    const context = await contextFor(formData);

    if (!context) {
      return errorState("You are not a member of that group");
    }

    const todoId = String(formData.get("todoId") ?? "");

    const updated = await db
      .update(todoItems)
      .set({ completedAt: null })
      .where(and(eq(todoItems.id, todoId), eq(todoItems.groupId, context.group.id)))
      .returning({ id: todoItems.id });

    if (updated.length === 0) {
      return errorState("That item no longer exists");
    }

    revalidatePath(`/groups/${context.group.name}`);
    revalidatePath(`/groups/${context.group.name}/todos/archive`);
    return successState();
  });
}

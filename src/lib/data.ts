import { and, asc, count, eq, gte, inArray } from "drizzle-orm";

import { db } from "@/db";
import { appointments, groups, memberships } from "@/db/schema";

export type MemberDTO = {
  id: string;
  displayName: string;
  isSelf: boolean;
};

export type AppointmentDTO = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  memberId: string;
  memberName: string;
  isOwn: boolean;
};

export type GroupSummary = {
  id: string;
  name: string;
  displayName: string;
  memberCount: number;
};

export async function getUserGroups(userId: string): Promise<GroupSummary[]> {
  const rows = await db
    .select({
      id: groups.id,
      name: groups.name,
      displayName: memberships.displayName,
    })
    .from(memberships)
    .innerJoin(groups, eq(groups.id, memberships.groupId))
    .where(eq(memberships.userId, userId))
    .orderBy(asc(groups.name));

  if (rows.length === 0) return [];

  const counts = await db
    .select({ groupId: memberships.groupId, count: count() })
    .from(memberships)
    .where(
      inArray(
        memberships.groupId,
        rows.map((row) => row.id),
      ),
    )
    .groupBy(memberships.groupId);

  const countByGroup = new Map(counts.map((row) => [row.groupId, row.count]));

  return rows.map((row) => ({
    ...row,
    memberCount: countByGroup.get(row.id) ?? 1,
  }));
}

export type GroupContext = {
  group: { id: string; name: string };
  membership: { id: string; displayName: string };
};

/** Returns the group only when the user is actually a member of it. */
export async function getGroupContext(
  userId: string,
  groupName: string,
): Promise<GroupContext | null> {
  const [row] = await db
    .select({
      groupId: groups.id,
      groupName: groups.name,
      membershipId: memberships.id,
      displayName: memberships.displayName,
    })
    .from(groups)
    .innerJoin(
      memberships,
      and(eq(memberships.groupId, groups.id), eq(memberships.userId, userId)),
    )
    .where(eq(groups.name, groupName.toLowerCase()))
    .limit(1);

  if (!row) return null;

  return {
    group: { id: row.groupId, name: row.groupName },
    membership: { id: row.membershipId, displayName: row.displayName },
  };
}

export async function getGroupMembers(
  groupId: string,
  ownMembershipId: string,
): Promise<MemberDTO[]> {
  const rows = await db
    .select({ id: memberships.id, displayName: memberships.displayName })
    .from(memberships)
    .where(eq(memberships.groupId, groupId))
    .orderBy(asc(memberships.joinedAt));

  return rows.map((row) => ({
    ...row,
    isSelf: row.id === ownMembershipId,
  }));
}

/**
 * Appointments that end at or after `since`, oldest first. The calendar
 * navigates client-side, so a generous window is loaded up front.
 */
export async function getGroupAppointments(
  groupId: string,
  ownMembershipId: string,
  since: Date,
): Promise<AppointmentDTO[]> {
  const rows = await db
    .select({
      id: appointments.id,
      title: appointments.title,
      startsAt: appointments.startsAt,
      endsAt: appointments.endsAt,
      memberId: appointments.memberId,
      memberName: memberships.displayName,
    })
    .from(appointments)
    .innerJoin(memberships, eq(memberships.id, appointments.memberId))
    .where(and(eq(appointments.groupId, groupId), gte(appointments.endsAt, since)))
    .orderBy(asc(appointments.startsAt));

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    memberId: row.memberId,
    memberName: row.memberName,
    isOwn: row.memberId === ownMembershipId,
  }));
}

export async function getOwnAppointment(
  appointmentId: string,
  ownMembershipId: string,
) {
  const [row] = await db
    .select({
      id: appointments.id,
      title: appointments.title,
      startsAt: appointments.startsAt,
      endsAt: appointments.endsAt,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.id, appointmentId),
        eq(appointments.memberId, ownMembershipId),
      ),
    )
    .limit(1);

  return row ?? null;
}

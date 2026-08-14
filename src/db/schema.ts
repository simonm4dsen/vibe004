import { relations, sql } from "drizzle-orm";
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const groups = pgTable(
  "groups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("groups_name_unique").on(table.name)],
);

export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("memberships_group_user_unique").on(table.groupId, table.userId),
    uniqueIndex("memberships_group_display_name_unique").on(
      table.groupId,
      sql`lower(${table.displayName})`,
    ),
  ],
);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => memberships.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("appointments_group_starts_at_idx").on(table.groupId, table.startsAt)],
);

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(memberships),
  createdGroups: many(groups),
}));

export const groupsRelations = relations(groups, ({ many, one }) => ({
  memberships: many(memberships),
  appointments: many(appointments),
  creator: one(users, {
    fields: [groups.createdBy],
    references: [users.id],
  }),
}));

export const membershipsRelations = relations(memberships, ({ many, one }) => ({
  group: one(groups, {
    fields: [memberships.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  appointments: many(appointments),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  group: one(groups, {
    fields: [appointments.groupId],
    references: [groups.id],
  }),
  member: one(memberships, {
    fields: [appointments.memberId],
    references: [memberships.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type Group = typeof groups.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;

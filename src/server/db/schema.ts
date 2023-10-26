import { type AdapterAccount } from "next-auth/adapters";
import {
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, relations } from "drizzle-orm";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const pgTable = pgTableCreator((name) => `diaproject_${name}`);

export const rooms = pgTable(
  "rooms",
  {
    roomCode: integer("roomCode").primaryKey(),
    projectName: varchar("projectName", { length: 64 }).notNull(),
    userId: varchar("userId", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  },
  ({ userId }) => ({
    userIdIdx: index("userId_idx").on(userId),
  }),
);

const roomsRelations = relations(rooms, ({ one }) => ({
  user: one(users, { fields: [rooms.userId], references: [users.id] }),
  project: one(projects, {
    fields: [rooms.projectName],
    references: [projects.name],
  }),
}));

export const projects = pgTable(
  "projects",
  {
    name: varchar("name", { length: 64 }).notNull(),
    description: varchar("description", { length: 1024 }),
    timeLimitInMinutes: integer("timeLimitInMinutes").notNull().default(1440),
    userId: varchar("userId", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
  },
  (project) => ({
    name_id: primaryKey(project.name, project.userId),
  }),
);
export type SelectProject = InferSelectModel<typeof projects>;
export type InsertProject = InferInsertModel<typeof projects>;

const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  room: one(rooms, {
    fields: [projects.name],
    references: [rooms.projectName],
  }),
}));

export const users = pgTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", {
    mode: "date",
  }).defaultNow(),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  projects: many(projects),
}));

export const accounts = pgTable(
  "account",
  {
    userId: varchar("userId", { length: 255 }).notNull(),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
    userIdIdx: index("userId_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = pgTable(
  "session",
  {
    sessionToken: varchar("sessionToken", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("userId", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (session) => ({
    userIdIdx: index("userId_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  }),
);

import type { InferSelectModel } from 'drizzle-orm';
import { bigint, boolean, pgEnum, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const userTbl = pgTable('user', {
	id: text('id').primaryKey(),
	username: varchar('username', {
		length: 31
	})
		.notNull()
		.unique(),
	hashedPassword: text('hashed_password').notNull(),
	isAdmin: boolean('isAdmin').notNull().default(false)
});

export const sessionTbl = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => userTbl.id),
	expiresAt: timestamp('expires_at', {
		withTimezone: true,
		mode: 'date'
	}).notNull()
});

export const inviteTbl = pgTable('invite', {
	id: varchar('id', {
		length: 255
	}).primaryKey(),
	expires: bigint('expires', {
		mode: 'number'
	}).notNull()
});

export const shoppingListTbl = pgTable('shopping_list', {
	id: varchar('id', { length: 15 }).primaryKey(),
	name: varchar('name', { length: 300 })
});

export type SelectShoppingList = InferSelectModel<typeof shoppingListTbl>;

export const operationEnum = pgEnum('operation', ['add', 'remove']);

export const historyTbl = pgTable('history', {
	timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
	name: varchar('name', { length: 300 }),
	operation: operationEnum('operation')
});

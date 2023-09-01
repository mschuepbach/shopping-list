import type { InferSelectModel } from 'drizzle-orm';
import { pgTable, bigint, varchar, boolean } from 'drizzle-orm/pg-core';

export const user = pgTable('auth_user', {
	id: varchar('id', {
		length: 15 // change this when using custom user ids
	}).primaryKey(),
	username: varchar('username', {
		length: 31
	})
		.notNull()
		.unique(),
	isAdmin: boolean('isAdmin').notNull().default(false)
});

export const session = pgTable('user_session', {
	id: varchar('id', {
		length: 128
	}).primaryKey(),
	userId: varchar('user_id', {
		length: 15
	})
		.notNull()
		.references(() => user.id),
	activeExpires: bigint('active_expires', {
		mode: 'number'
	}).notNull(),
	idleExpires: bigint('idle_expires', {
		mode: 'number'
	}).notNull()
});

export const key = pgTable('user_key', {
	id: varchar('id', {
		length: 255
	}).primaryKey(),
	userId: varchar('user_id', {
		length: 15
	})
		.notNull()
		.references(() => user.id),
	hashedPassword: varchar('hashed_password', {
		length: 255
	})
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

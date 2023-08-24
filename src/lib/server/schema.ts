import type { InferSelectModel } from 'drizzle-orm';
import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const shoppingListTbl = pgTable('shopping_list', {
	id: varchar('id', { length: 15 }).primaryKey(),
	item: varchar('item', { length: 300 })
});

export type SelectShoppingList = InferSelectModel<typeof shoppingListTbl>;
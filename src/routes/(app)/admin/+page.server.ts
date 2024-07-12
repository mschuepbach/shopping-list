import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { inviteTbl, userTbl } from '$lib/server/schema';
import { nanoid } from 'nanoid';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = locals;
	if (!user) redirect(302, '/login');
	if (!user.isAdmin) return fail(403);

	const users = await db.select().from(userTbl);
	const invites = await db.select().from(inviteTbl);
	return { users, invites };
};

const expires = 1000 * 60 * 30;

export const actions: Actions = {
	default: async () => {
		await db
			.insert(inviteTbl)
			.values({ id: nanoid(), expires: new Date(new Date().getTime() + expires).getTime() });
	}
};

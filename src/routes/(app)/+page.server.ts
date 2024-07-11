import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/lucia';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { shoppingListTbl } from '$lib/server/schema';

export const load: PageServerLoad = async () => {
	const items = await db.select().from(shoppingListTbl);
	return { items };
};

export const actions: Actions = {
	logout: async ({ locals }) => {
		const session = await locals.auth.validate();
		if (!session) return fail(401);
		await auth.invalidateSession(session.sessionId); // invalidate session
		locals.auth.setSession(null); // remove cookie
		redirect(302, '/login'); // redirect to login page
	}
};

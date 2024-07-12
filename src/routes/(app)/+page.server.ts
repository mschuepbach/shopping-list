import { fail, redirect } from '@sveltejs/kit';
import { lucia } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { shoppingListTbl } from '$lib/server/schema';

export const load: PageServerLoad = async () => {
	const items = await db.select().from(shoppingListTbl);
	return { items };
};

export const actions: Actions = {
	logout: async ({ locals, cookies }) => {
		if (!locals.session) return fail(401);
		await lucia.invalidateSession(locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		redirect(302, '/login'); // redirect to login page
	}
};

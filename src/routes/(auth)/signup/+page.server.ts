import { db } from '$lib/server/db';
import { auth } from '$lib/server/lucia';
import { inviteTbl } from '$lib/server/schema';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import pg from 'pg';
import type { Actions, PageServerLoad } from './$types';

const { DatabaseError } = pg;

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.auth.validate();
	if (session) throw redirect(302, '/');
	const inviteId = url.searchParams.get('invite_id');
	return { inviteId };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');
		const inviteId = formData.get('inviteId');
		// basic check
		if (typeof username !== 'string' || username.length < 4 || username.length > 31) {
			return fail(400, {
				message: 'Invalid username'
			});
		}
		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			return fail(400, {
				message: 'Invalid password'
			});
		}
		if (typeof inviteId !== 'string' || inviteId.length === 0)
			return fail(404, { message: 'Invite is required' });
		const invites = await db.select().from(inviteTbl).where(eq(inviteTbl.id, inviteId));
		if (invites.length === 0) return fail(404, { message: 'Invalid invite' });
		const [invite] = invites;
		const diff = invite.expires - new Date().getTime();
		if (diff <= 0) return fail(404, { message: 'Invalid invite' });
		try {
			const user = await auth.createUser({
				key: {
					providerId: 'username', // auth method
					providerUserId: username.toLowerCase(), // unique id when using "username" auth method
					password // hashed by Lucia
				},
				attributes: {
					username,
					isAdmin: false
				}
			});
			const session = await auth.createSession({
				userId: user.userId,
				attributes: {}
			});
			locals.auth.setSession(session); // set session cookie
			await db.delete(inviteTbl).where(eq(inviteTbl.id, inviteId));
		} catch (e) {
			// check for unique constraint error in user table
			if (e instanceof DatabaseError && e?.code === '23505') {
				return fail(400, {
					message: 'Username is already taken'
				});
			}
			return fail(500, {
				message: 'An unknown error occurred'
			});
		}
		throw redirect(302, '/');
	}
};

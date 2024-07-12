import { db } from '$lib/server/db';
import { lucia } from '$lib/server/auth';
import { inviteTbl, userTbl } from '$lib/server/schema';
import { generateIdFromEntropySize, LegacyScrypt } from 'lucia';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import pg from 'pg';
import type { Actions, PageServerLoad } from './$types';

const { DatabaseError } = pg;

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) redirect(302, '/');
	const inviteId = url.searchParams.get('invite_id');
	return { inviteId };
};

export const actions: Actions = {
	default: async ({ request, locals, cookies }) => {
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
			const passwordHash = await new LegacyScrypt().hash(password);
			const userId = generateIdFromEntropySize(10);

			await db.insert(userTbl).values({
				id: userId,
				username,
				hashedPassword: passwordHash
			});

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
			await db.delete(inviteTbl).where(eq(inviteTbl.id, inviteId));
		} catch (e) {
			// check for unique constraint error in user table
			if (e instanceof DatabaseError && e?.code === '23505') {
				return fail(400, {
					message: 'Username is already taken'
				});
			}
			console.error(e);
			return fail(500, {
				message: 'An unknown error occurred'
			});
		}
		return redirect(302, '/');
	}
};

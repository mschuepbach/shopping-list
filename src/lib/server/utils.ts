import { env } from '$env/dynamic/private';
import { auth } from '$lib/server/lucia';
import pg from 'pg';

const { DatabaseError } = pg;

export async function createAdminUser() {
	const username = env.ADMIN_USERNAME;
	const password = env.ADMIN_PASSWORD;

	if (!username || !password) throw Error('Admin username and password are required.');

	try {
		await auth.createUser({
			key: {
				providerId: 'username', // auth method
				providerUserId: username.toLowerCase(), // unique id when using "username" auth method
				password // hashed by Lucia
			},
			attributes: {
				username,
				isAdmin: true
			}
		});
	} catch (e) {
		if (!(e instanceof DatabaseError && e?.code === '23505')) {
			throw e;
		}
	}
}

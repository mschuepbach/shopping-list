import { dev } from '$app/environment';
import { createAdminUser } from '$lib/server/utils';
import { pg } from '@lucia-auth/adapter-postgresql';
import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import { pg as pool } from './db';

export const auth = lucia({
	adapter: pg(pool, {
		user: 'auth_user',
		key: 'user_key',
		session: 'user_session'
	}),
	middleware: sveltekit(),
	env: dev ? 'DEV' : 'PROD',
	getUserAttributes: (data) => {
		return {
			username: data.username,
			isAdmin: data.isAdmin
		};
	}
});

await createAdminUser();

export type Auth = typeof auth;

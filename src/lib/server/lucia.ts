import { lucia } from 'lucia';
import { pg } from '@lucia-auth/adapter-postgresql';
import { sveltekit } from 'lucia/middleware';
import { dev } from '$app/environment';
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

export type Auth = typeof auth;

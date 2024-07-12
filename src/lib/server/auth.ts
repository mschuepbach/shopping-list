import { building, dev } from '$app/environment';
import { createAdminUser } from '$lib/server/utils';
import { Lucia, TimeSpan } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from './db';
import { sessionTbl, userTbl } from './schema';

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTbl, userTbl);

export const lucia = new Lucia(adapter, {
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
			isAdmin: attributes.isAdmin
		};
	},
	sessionExpiresIn: new TimeSpan(30, 'd'), // no more active/idle
	sessionCookie: {
		name: 'session',
		expires: false, // session cookies have very long lifespan (2 years)
		attributes: {
			secure: dev,
			sameSite: 'strict'
		}
	}
});

if (!building) {
	await createAdminUser();
}

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	username: string;
	isAdmin: boolean;
}

import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { auth } from '$lib/server/lucia';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
	connectionString: env.DB_URL
});

const db = drizzle(pool, { logger: true });

if (!building) {
	const init = async () => {
		await migrate(db, { migrationsFolder: './drizzle' });
		await createAdminUser();
	};

	init();
}

async function createAdminUser() {
	const username = env.ADMIN_USERNAME;
	const password = env.ADMIN_PASSWORD;

	if (!username || !password) throw Error('Admin username and password are required.');

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
}

export { db, pool as pg };

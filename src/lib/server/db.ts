import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
	connectionString: env.DB_URL
});

const db = drizzle(pool, { logger: true });

if (!building) {
	await migrate(db, { migrationsFolder: './drizzle' });
}

export { db, pool as pg };

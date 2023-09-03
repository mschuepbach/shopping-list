import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
	connectionString: env.DB_URL
});

const db = drizzle(pool, { logger: true });

export { db, pool as pg };

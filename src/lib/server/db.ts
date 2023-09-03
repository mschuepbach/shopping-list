import { DB_URL } from '$env/static/private';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
	connectionString: DB_URL
});

const db = drizzle(pool, { logger: true });

export { db, pool as pg };

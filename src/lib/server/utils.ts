import { env } from '$env/dynamic/private';
import pg from 'pg';
import { db } from './db';
import { userTbl } from './schema';
import { LegacyScrypt, generateIdFromEntropySize } from 'lucia';

const { DatabaseError } = pg;

export async function createAdminUser() {
	const username = env.ADMIN_USERNAME;
	const password = env.ADMIN_PASSWORD;

	if (!username || !password) throw Error('Admin username and password are required.');

	try {
		const passwordHash = await new LegacyScrypt().hash(password);
		const userId = generateIdFromEntropySize(10);

		await db.insert(userTbl).values({
			id: userId,
			username: username.toLowerCase(),
			hashedPassword: passwordHash,
			isAdmin: true
		});
	} catch (e) {
		// ignore unique constraint error if admin user already exists
		if (!(e instanceof DatabaseError && e?.code === '23505')) {
			throw e;
		}
	}
}

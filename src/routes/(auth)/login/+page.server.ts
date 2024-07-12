import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { userTbl } from '$lib/server/schema';
import { eq } from 'drizzle-orm';
import { LegacyScrypt } from 'lucia';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(302, '/');
	return {};
};

const limiterUsernameAndIp = new RateLimiterMemory({
	points: 5,
	keyPrefix: 'login_fail_username_and_ip',
	duration: 60,
	blockDuration: 60 // Block for 1 minute, if 5 wrong attempts per minute
});

const limiterIp = new RateLimiterMemory({
	points: 100,
	keyPrefix: 'login_fail_ip',
	duration: 60 * 60 * 24,
	blockDuration: 60 * 60 * 24 // Block for 1 day, if 100 wrong attempts per day
});

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const clientAddress = getClientAddress();
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');
		const usernameIpKey = `${username}_${clientAddress}`;

		if (
			typeof username !== 'string' ||
			username.length < 1 ||
			username.length > 31 ||
			typeof password !== 'string' ||
			password.length < 1 ||
			password.length > 255
		) {
			return fail(400, {
				message: 'Incorrect username or password'
			});
		}

		const [usernameLimit, ipLimit] = await Promise.all([
			limiterUsernameAndIp.get(usernameIpKey),
			limiterIp.get(clientAddress)
		]);

		let retrySecs = 0;

		if (ipLimit && ipLimit.remainingPoints <= 0) {
			retrySecs = Math.round(ipLimit.msBeforeNext / 1000) || 1;
		} else if (usernameLimit && usernameLimit.remainingPoints <= 0) {
			retrySecs = Math.round(usernameLimit.msBeforeNext / 1000) || 1;
		}

		if (retrySecs > 0) {
			return fail(429, {
				message: `Too many tries. Please wait ${retrySecs} seconds.`
			});
		}

		const user = (await db.select().from(userTbl).where(eq(userTbl.username, username)))[0];
		const validPassword = await new LegacyScrypt().verify(user?.hashedPassword ?? '', password);

		if (!user || !validPassword) {
			await Promise.all([
				limiterUsernameAndIp.consume(usernameIpKey),
				limiterIp.consume(clientAddress)
			]);
			return fail(400, {
				message: 'Incorrect username or password'
			});
		}

		if (usernameLimit && usernameLimit.consumedPoints > 0) {
			await limiterUsernameAndIp.delete(usernameIpKey);
		}

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		return redirect(302, '/');
	}
};

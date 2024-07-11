import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const session = await locals.auth.validate();
	if (!session) redirect(302, '/login');
	return {
		userId: session.user.userId,
		username: session.user.username,
		isAdmin: session.user.isAdmin,
	};
};

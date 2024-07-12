import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { user } = locals;
	if (!user) redirect(302, '/login');
	return {
		userId: user.id,
		username: user.username,
		isAdmin: user.isAdmin
	};
};

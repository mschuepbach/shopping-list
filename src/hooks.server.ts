import { building } from '$app/environment';
import { lucia } from '$lib/server/auth';
import type { ExtendedGlobal, ExtendedWebSocket } from '$lib/server/webSocketUtils';
import { GlobalThisWSS } from '$lib/server/webSocketUtils';
import type { Handle } from '@sveltejs/kit';
import { and, eq, gte, notInArray, sql } from 'drizzle-orm';
import { customAlphabet } from 'nanoid';
import { WebSocket } from 'ws';
import { db } from './lib/server/db';
import { historyTbl, shoppingListTbl } from './lib/server/schema';

interface WsData {
	operation: 'add' | 'remove';
	name?: string;
	id?: string;
}

const alphabet = '0123456789';
const nanoid = customAlphabet(alphabet, 9);

// This can be extracted into a separate file
let wssInitialized = false;
const startupWebsocketServer = async () => {
	if (wssInitialized) return;
	console.log('[wss:kit] setup');
	let items = await db.select().from(shoppingListTbl);
	let recommendations = await getRecommendations(items.map((i) => i.name!));

	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
	if (wss !== undefined) {
		wss.on('connection', async (ws: ExtendedWebSocket) => {
			// This is where you can authenticate the client from the request
			// const session = await getSessionFromCookie(request.headers.cookie || '');
			// if (!session) ws.close(1008, 'User not authenticated');
			// ws.userId = session.userId;
			console.log(`[wss:kit] client connected (${ws.socketId})`);
			ws.send(`Hello from SvelteKit ${new Date().toLocaleString()} (${ws.socketId})]`);
			ws.send(JSON.stringify({ items, recommendations }));
			ws.on('message', async (data: string) => {
				console.log(`[wss:kit] received: ${data}`);
				let { operation, name, id }: WsData = JSON.parse(data);
				switch (operation) {
					case 'add': {
						const newItem = { id: nanoid(), name: name! };
						await db.insert(shoppingListTbl).values(newItem);
						items.push(newItem);
						break;
					}
					case 'remove': {
						const deleted: { name: string | null }[] = await db
							.delete(shoppingListTbl)
							.where(eq(shoppingListTbl.id, id!))
							.returning({ name: shoppingListTbl.name });
						items = items.filter((i) => i.id !== id!);
						name = deleted[0]?.name ?? undefined;
						break;
					}
				}
				await db.insert(historyTbl).values({ name, operation });
				recommendations = await getRecommendations(items.map((i) => i.name!));
				wss.clients.forEach((c) => {
					if (c.readyState === WebSocket.OPEN) {
						c.send(JSON.stringify({ items, recommendations }));
					}
				});
			});

			ws.on('close', () => {
				console.log(`[wss:kit] client disconnected (${ws.socketId})`);
			});
		});
		wssInitialized = true;
	}
};

const getRecommendations = async (items: string[]) => {
	const where = [eq(historyTbl.operation, 'remove')];

	if (items.length > 0) {
		where.push(notInArray(historyTbl.name, items));
	}

	const history = await db
		.select({
			count: sql<number>`count(*)`,
			name: historyTbl.name,
			timestamps: sql<Date[]>`array_agg(${historyTbl.timestamp})`
		})
		.from(historyTbl)
		.where(and(...where))
		.groupBy(historyTbl.name)
		.having(({ count }) => gte(count, 2));

	const recommendations = history
		.map((i) => {
			const first = i.timestamps[0].getTime();
			const last = i.timestamps[i.count - 1].getTime();
			const average = (last - first) / i.count - 1;
			const diff = new Date().getTime() - (last + average);
			return {
				name: i.name,
				diff
			};
		})
		.sort((a, b) => a.diff - b.diff)
		.map((i) => i.name);

	return recommendations;
};

export const handle = (async ({ event, resolve }) => {
	startupWebsocketServer();

	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	event.locals.user = user;
	event.locals.session = session;

	// Skip WebSocket server when pre-rendering pages
	if (!building) {
		const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
		if (wss !== undefined) {
			event.locals.wss = wss;
		}
	}
	const response = await resolve(event, {
		filterSerializedResponseHeaders: (name) => name === 'content-type'
	});
	return response;
}) satisfies Handle;

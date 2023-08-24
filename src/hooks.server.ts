import { building } from '$app/environment';
import type { ExtendedGlobal, ExtendedWebSocket } from '$lib/server/webSocketUtils';
import { GlobalThisWSS } from '$lib/server/webSocketUtils';
import type { Handle } from '@sveltejs/kit';
import { customAlphabet } from 'nanoid';
import { db } from './lib/server/db';
import { shoppingListTbl } from './lib/server/schema';

const alphabet = '0123456789';
const nanoid = customAlphabet(alphabet, 9);

// This can be extracted into a separate file
let wssInitialized = false;
const startupWebsocketServer = () => {
	if (wssInitialized) return;
	console.log('[wss:kit] setup');
	const wss = (globalThis as ExtendedGlobal)[GlobalThisWSS];
	if (wss !== undefined) {
		wss.on('connection', async (ws: ExtendedWebSocket, _request) => {
			// This is where you can authenticate the client from the request
			// const session = await getSessionFromCookie(request.headers.cookie || '');
			// if (!session) ws.close(1008, 'User not authenticated');
			// ws.userId = session.userId;
			console.log(`[wss:kit] client connected (${ws.socketId})`);
			ws.send(`Hello from SvelteKit ${new Date().toLocaleString()} (${ws.socketId})]`);
			const items = await db.select().from(shoppingListTbl);
			ws.send(JSON.stringify(items));

			ws.on('message', async (data: string) => {
				console.log(`[wss:kit] received: ${data}`);
				const newItem = { id: nanoid(), item: data.toString() };
				await db.insert(shoppingListTbl).values(newItem);
				items.push(newItem);
				ws.send(JSON.stringify(items));
			});

			ws.on('close', () => {
				console.log(`[wss:kit] client disconnected (${ws.socketId})`);
			});
		});
		wssInitialized = true;
	}
};

export const handle = (async ({ event, resolve }) => {
	startupWebsocketServer();
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

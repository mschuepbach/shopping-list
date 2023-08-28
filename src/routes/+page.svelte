<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import type { SelectShoppingList } from '../lib/server/schema';

	let webSocketEstablished = false;
	let ws: WebSocket | null = null;
	let items: SelectShoppingList[] = [];
	let newItem = '';
	let log: string[] = [];

	const logEvent = (str: string) => {
		log = [...log, str];
	};

	const establishWebSocket = () => {
		if (webSocketEstablished) return;
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		ws = new WebSocket(`${protocol}//${window.location.host}/websocket`);
		ws.addEventListener('open', (event) => {
			webSocketEstablished = true;
			console.log('[websocket] connection open', event);
			logEvent('[websocket] connection open');
		});
		ws.addEventListener('close', (event) => {
			console.log('[websocket] connection closed', event);
			logEvent('[websocket] connection closed');
		});
		ws.addEventListener('message', (event) => {
			console.log('[websocket] message received', event);
			logEvent(`[websocket] message received: ${event.data}`);
			try {
				items = JSON.parse(event.data);
			} catch (error) {}
		});
	};

	const sendData = async () => {
		ws?.send(newItem);
		newItem = '';
	};

	onMount(() => {
		establishWebSocket();
	});

	onDestroy(() => {
		ws?.close();
	});
</script>

<main class="w-full h-full flex flex-col p-2 items-center justify-between">
	<div class="flex flex-wrap gap-2 overflow-auto">
		{#each items as item}
			<div class="w-24 h-24 p-2 bg-orange-700 text-secondary rounded flex justify-center items-center break-words select-none">{item.item}</div>
		{/each}
	</div>
	<div class="w-full flex gap-2">
		<Input class="w-full" bind:value={newItem} />
		<Button on:click={() => sendData()}>Add</Button>
	</div>
</main>

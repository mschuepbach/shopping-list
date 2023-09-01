<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import type { PageData } from './$types';

	export let data: PageData;
	let webSocketEstablished = false;
	let ws: WebSocket | null = null;
	let items = data.items;
	let newItem = '';

	const establishWebSocket = () => {
		if (webSocketEstablished) return;
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		ws = new WebSocket(`${protocol}//${window.location.host}/websocket`);
		ws.addEventListener('open', (event) => {
			webSocketEstablished = true;
			console.log('[websocket] connection open', event);
		});
		ws.addEventListener('close', (event) => {
			console.log('[websocket] connection closed', event);
		});
		ws.addEventListener('message', (event) => {
			console.log('[websocket] message received', event);
			try {
				items = JSON.parse(event.data);
			} catch (error) {}
		});
	};

	const addItem = async () => {
		ws?.send(JSON.stringify({ operation: 'add', name: newItem }));
		newItem = '';
	};

	const removeItem = async (id: string) => {
		ws?.send(JSON.stringify({ operation: 'remove', id }));
	};

	onMount(() => {
		establishWebSocket();
	});

	onDestroy(() => {
		ws?.close();
	});
</script>

{#if items.length > 0}
	<div class="flex flex-wrap gap-2 overflow-y-auto p-2">
		{#each items as item}
			<Button class="h-24 w-24 bg-orange-700" on:click={() => removeItem(item.id)}>
				{item.name}
			</Button>
		{/each}
	</div>
{:else}
<div class="m-auto">
	<p class="text-muted-foreground">No Items</p>
</div>
{/if}
<div class="mt-auto flex w-full gap-2 p-2">
	<Input class="w-full" bind:value={newItem} />
	<Button on:click={() => addItem()}>Add</Button>
</div>

<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { onDestroy, onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	let ws: WebSocket | null = null;
	let items = data.items;
	let newItem = '';
	let allRecommendations: string[] = [];
	let recommendations: string[] = [];
	let showOffline = false;

	const establishWebSocket = () => {
		if (ws?.readyState === WebSocket.OPEN) return;
		const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
		ws = new WebSocket(`${protocol}//${window.location.host}/websocket`);
		ws.addEventListener('open', (event) => {
			console.log('[websocket] connection open', event);
			showOffline = false;
		});
		ws.addEventListener('close', (event) => {
			console.log('[websocket] connection closed', event);
			showOffline = true;
			establishWebSocket();
		});
		ws.addEventListener('message', (event) => {
			console.log('[websocket] message received', event);
			try {
				const data = JSON.parse(event.data);
				items = data.items;
				allRecommendations = data.recommendations;
				updateRecommendations();
			} catch (error) {}
		});
	};

	const handleSubmit = async (e: SubmitEvent) => {
		e.preventDefault();
		addItem(newItem);
	};

	const addItem = async (name: string) => {
		if (name !== '' && ws?.readyState === WebSocket.OPEN) {
			ws?.send(JSON.stringify({ operation: 'add', name }));
			newItem = '';
		}
	};

	const removeItem = async (id: string) => {
		if (ws?.readyState === WebSocket.OPEN) {
			ws?.send(JSON.stringify({ operation: 'remove', id }));
		}
	};

	const updateRecommendations = () => {
		recommendations = newItem
			? allRecommendations.filter((r) => r?.startsWith(newItem))
			: allRecommendations;
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
<div class="mt-auto">
	{#if showOffline}
		<div class="flex h-6 w-full items-center justify-center bg-red-600 text-sm text-white">
			You are offline
		</div>
	{/if}
	<div class="flex w-full gap-2 overflow-auto px-2">
		{#each recommendations as recommendation}
			<Button variant="secondary" on:click={() => addItem(recommendation)}>{recommendation}</Button>
		{/each}
	</div>
	<div class="w-full">
		<form
			class="flex w-full gap-2 p-2"
			on:submit={(e) => handleSubmit(e)}
			on:input={updateRecommendations}
		>
			<Input class="w-full" bind:value={newItem} />
			<Button>Add</Button>
		</form>
	</div>
</div>

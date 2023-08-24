<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";

	let webSocketEstablished = false;
	let ws: WebSocket | null = null;
	let items: string[] = [];
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

	const requestData = async () => {
		const res = await fetch('/api/test');
		const data = await res.json();
		console.log('Data from GET endpoint', data);
		logEvent(`[GET] data received: ${data}`);
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

<main>
	<h1>SvelteKit with WebSocket Integration</h1>

	{#each items as item}
		<div>{item}</div>
	{/each}

	<div class="flex gap-2">
		<Input bind:value={newItem} />
		<Button on:click={() => sendData()}> Send data to server </Button>
	</div>
	
	<Button disabled={webSocketEstablished} on:click={() => establishWebSocket()}>
			Establish WebSocket connection
	</Button>

	<Button on:click={() => requestData()}> Request Data from GET endpoint </Button>

	<ul>
		{#each log as event}
			<li>{event}</li>
		{/each}
	</ul>
</main>

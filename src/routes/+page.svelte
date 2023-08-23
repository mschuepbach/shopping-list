<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

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

	<input bind:value={newItem} />

	<button disabled={webSocketEstablished} on:click={() => establishWebSocket()}>
		Establish WebSocket connection
	</button>

	<button on:click={() => requestData()}> Request Data from GET endpoint </button>
	<button on:click={() => sendData()}> Send data to server </button>

	<ul>
		{#each log as event}
			<li>{event}</li>
		{/each}
	</ul>
</main>

<style>
	main {
		font-family: sans-serif;
	}
</style>

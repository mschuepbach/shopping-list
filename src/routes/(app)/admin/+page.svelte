<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';
	import type { ButtonEventHandler } from 'bits-ui/dist/bits/button';

	export let data: PageData;

	function renderExpires(expires: number) {
		const diff = expires - new Date().getTime();
		if (diff <= 0) return 'expired';
		const minutes = Math.floor(diff / (1000 * 60));
		const seconds = Math.floor((diff / (1000 * 60) - minutes) * 60);
		return `expires in ${minutes}m ${seconds}s`;
	}

	function copyToClipboard(e: ButtonEventHandler<MouseEvent>) {
		const id = e?.target?.innerText;
		navigator.clipboard.writeText(`${window.location.origin}/signup?invite_id=${id}`);
	}
</script>

<div class="m-2 flex flex-wrap gap-2">
	<Card.Root class="w-96">
		<Card.Header>
			<Card.Title>Users</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if data.users && data.users.length > 0}
				{#each data.users as user}
					<div class="flex justify-between">
						<div>{user.username}</div>
					</div>
				{/each}
			{:else}
				<p class="text-muted-foreground">No users</p>
			{/if}
		</Card.Content>
	</Card.Root>
	<Card.Root class="w-96">
		<Card.Header>
			<Card.Title>Invites</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if data.invites && data.invites.length > 0}
				{#each data.invites as invite}
					<div class="flex justify-between">
						<Button variant="link" title="Click to copy invite url" on:click={copyToClipboard}>
							{invite.id}
						</Button>
						<div class="text-muted-foreground">{renderExpires(invite.expires)}</div>
					</div>
				{/each}
			{:else}
				<p class="text-muted-foreground">No active invites</p>
			{/if}
		</Card.Content>
		<Card.Footer>
			<form method="POST" class="w-full" use:enhance>
				<Button class="w-full">Create invite</Button>
			</form>
		</Card.Footer>
	</Card.Root>
</div>

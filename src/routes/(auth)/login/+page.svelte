<script lang="ts">
	import { enhance } from '$app/forms';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';

	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Login</Card.Title>
	</Card.Header>
	<Card.Content>
		<form id="form" method="POST" use:enhance>
			<div class="grid gap-6 p-2">
				<div class="grid gap-2">
					<Label for="username">Username</Label>
					<Input type="text" id="username" name="username" />
				</div>
				<div class="grid gap-2">
					<Label for="password">Password</Label>
					<Input type="password" id="password" name="password" />
				</div>
			</div>
		</form>
		{#if form?.message}
			<p class="text-red-500">{form.message}</p>
		{/if}
	</Card.Content>
	<Card.Footer>
		<Button class="w-full" form="form">Login</Button>
	</Card.Footer>
</Card.Root>

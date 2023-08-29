<script lang="ts">
	import { enhance } from '$app/forms';
	import { Label } from '$lib/components/ui/label';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
</script>

<div>
	<h1>Login</h1>
	<form method="POST" use:enhance>
		<div class="grid gap-6 p-2">
			<div class="grid gap-2">
				<Label for="username">Username</Label>
				<Input type="text" id="username" name="username" />
			</div>
			<div class="grid gap-2">
				<Label for="password">Password</Label>
				<Input type="password" id="password" name="password" />
			</div>
			<Button class="w-full">Login</Button>
		</div>
	</form>
</div>

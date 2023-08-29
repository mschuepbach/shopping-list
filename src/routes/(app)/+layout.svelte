<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';
	import type { LayoutData } from './$types';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';

	export let data: LayoutData;
</script>

<div class="flex h-full flex-col">
	<div class="flex justify-between bg-stone-200 px-2 py-1">
		<div></div>
		<form method="POST" action="?/logout" use:enhance>
			<Button type="submit" variant="ghost" class="h-10 w-10 rounded-full">
				<Avatar.Root>
					<Avatar.Image src="#" alt="Profile image" />
					<Avatar.Fallback>{data.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
				</Avatar.Root>
			</Button>
		</form>
	</div>
	<slot />
</div>

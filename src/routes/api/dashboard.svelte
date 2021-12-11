<script lang="ts">
	import { getProfile } from '$lib/account';

	(async function () {
		const u = await getProfile();
		if (typeof window !== 'undefined') {
			if (u.user) {
				console.log(u);
				window.location.replace(`/@${u.profile.nickname}`);
			} else {
				window.location.replace(`/account/signin`);
			}
		}
	})();
</script>

<svelte:head>
	<title>Connecting..</title>
</svelte:head>

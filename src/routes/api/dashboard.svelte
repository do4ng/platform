<script lang="ts">
	import { getProfile } from '$lib/account';

	(async function () {
		const u = await getProfile();
		if (u.user) {
			window.location.replace(`/@${u.profile.nickname}`);
		} else {
			window.location.replace(`/account/signin`);
		}
	})();
</script>

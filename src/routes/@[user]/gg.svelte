<script context="module">
	export async function load({ page }) {
		return {
			props: {
				user: page.params.user
			}
		};
	}
</script>

<script>
	export let user;
	if (typeof window !== 'undefined') {
		window.location.replace(`/@${user}`);
	}
</script>

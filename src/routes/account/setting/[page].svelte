<script context="module">
	export async function load({ page }) {
		return {
			props: {
				page: page.params.page
			}
		};
	}
</script>

<script>
	export let page;
</script>

<div class="setting">
	<div class="title">Account Setting</div>
	{page}
</div>

<style lang="scss">
	.setting {
		width: 90%;
		margin: 50px auto;
		.title {
			font-weight: bold;
			font-size: 1.25rem;
		}
	}
</style>

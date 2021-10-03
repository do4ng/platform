<script context="module">
	export function load({ error, status }) {
		return {
			props: {
				title: `${status}: ${error.message}`
			}
		};
	}
</script>

<script>
	export let title;
</script>

<svelte:head>
	<title>오류가 발생했습니다</title>
</svelte:head>

<div class="pageerror">
	<div class="errortitle">오류가 발생했습니다.</div>
	<p class="errormessage">
		{title}
	</p>
</div>

<style lang="scss">
	.pageerror {
		text-align: center;
		margin: 15rem 0;
	}
	.errortitle {
		font-size: 1.25rem;
		font-weight: bold;
	}
	.errormessage {
		margin-top: 25px;
	}
</style>

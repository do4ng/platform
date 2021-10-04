<script lang="ts">
	export let data: { title: string; content: string };
</script>

<div class="c">
	<div class="c-title">{data.title}</div>
	<div class="c-content">{data.content}</div>
	<div class="c-slot"><slot /></div>
</div>

<style lang="scss">
	.c {
		max-width: 1024px;
		width: 24vw;
		height: 250px;
		border-radius: 0.85rem;
		padding: 18px 22px;
		box-shadow: 0 0 10px var(--theme-nav-color);
		.c-title {
			font-weight: bold;
			font-size: 1.45rem;
		}
		.c-content {
			font-size: 0.85rem;
			margin-top: 5px;
			color: var(--theme-gray);
		}
		.c-slot {
			margin-top: 5px;
		}
	}
</style>

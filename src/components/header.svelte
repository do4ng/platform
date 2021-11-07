<script>
	import { user } from '$lib/store/store';
</script>

<div class="header">
	<slot />
	<div class="header-main">
		<div class="header-content">
			<div class="header-title"><a href="/" class="no-deco">platform</a></div>
			<div class="theme-d">
				<div id="__nickname__">
					<span
						style="
						cursor: pointer;
						font-weight: bold;"
						on:click={() => {
							window.location.href = `/@${$user}`;
						}}>{$user === '__undefined__' || $user === null ? '' : $user}</span
					>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.header {
		margin: 0;
		width: 100%;
	}
	.header-main {
		display: flex;
		align-items: center;
		position: sticky;
		width: 100%;
		height: 60px;
		border-bottom: var(--theme-nav-color) 1px solid;
		vertical-align: middle;
	}
	.header-content {
		max-width: 1280px;
		display: flex;
		width: 90%;
		margin: 0 auto;
	}
	.header-title {
		font-weight: bold;
		font-size: 1.175rem;
	}
	.theme-d {
		display: flex;
		margin-left: auto;
	}
</style>

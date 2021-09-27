<div class="header">
	<slot />
	<div class="header-main">
		<div class="header-content">
			<div class="header-title"><a href="/" class="no-deco">platform</a></div>
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
		width: 90%;
		margin: 0 auto;
	}
	.header-title {
		font-weight: bold;
		font-size: 1.175rem;
	}
</style>

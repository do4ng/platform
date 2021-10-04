<script>
	function theme() {
		const classlist = document.querySelector('body').classList;
		if (!localStorage.getItem('theme')) {
			localStorage.setItem('theme', 'light');
		}
		if (localStorage.getItem('theme') === 'dark') {
			localStorage.setItem('theme', 'light');
			classlist.remove(`theme-dark`);
			classlist.add(`theme-light`);
		} else if (localStorage.getItem('theme') === 'light') {
			localStorage.setItem('theme', 'dark');
			classlist.remove(`theme-light`);
			classlist.add(`theme-dark`);
		}
	}
</script>

<div class="header">
	<slot />
	<div class="header-main">
		<div class="header-content">
			<div class="header-title"><a href="/" class="no-deco">platform</a></div>
			<div class="theme-d"><i class="fi fi-sr-moon" on:click={theme} /></div>
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
		margin-left: auto;
	}
</style>

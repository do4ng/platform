<script lang="ts">
	import Header from '../components/header.svelte';
	import { onMount } from 'svelte';
	import { getProfile } from '$lib/account';
	import { user } from '$lib/store/store';

	let usr: undefined | string = undefined;
	let users: undefined | string = undefined;

	(async function () {
		if (typeof window !== 'undefined' && !localStorage.getItem('nickname')) {
			usr = await (await getProfile()).profile.nickname;
			localStorage.setItem('nickname', usr);
			users = await localStorage.getItem('nickname');
			user.set(usr);
		} else if (typeof window !== 'undefined' && localStorage.getItem('nickname')) {
			usr = await (await getProfile()).profile.nickname;
			console.log(usr);
			if (usr === null) {
				user.set('__undefined__');
				localStorage.setItem('nickname', '__undefined__');
			}
		}
	})();

	onMount(async () => {
		users = await localStorage.getItem('nickname');
		user.set(users);
	});
</script>

<Header />
<div class="main">
	<slot />
</div>

<style lang="scss">
	@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap');
	@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400&display=swap');

	.main {
		width: 100%;
		max-width: 1280px;
		margin: 50px auto 0;
	}

	:global(body, html, #__app__) {
		margin: 0;
	}

	:root {
		font-family: 'Inter', 'Noto Sans KR', sans-serif;
		transition: all ease 0.2s 0s;
	}

	:global(.theme-dark) {
		/* dark theme */
		--theme-background: #161616;
		--theme-color: #ffffff;
		--theme-gray: #eeeeee;
		--theme-nav-color: #292929;
		--theme-nav-color-hover: #303030;
		--blue: #4ba0d9;
		--b-blue: #418bbd;
		--theme-button-gray: #383838;
	}

	:global(.theme-light) {
		/* white theme */
		--theme-background: #ffffff;
		--theme-color: #000000;
		--theme-gray: rgb(122, 122, 122);
		--theme-button-gray: #d1d1d1;
		--theme-nav-color: #e2e2e2;
		--theme-nav-color-hover: #d3d3d3;
		--blue: #31acff;
		--b-blue: #2d9de7;
	}

	:global(body) {
		background-color: var(--theme-background);
		color: var(--theme-color);
	}
	:global(*) {
		box-sizing: border-box;
	}
	:global(.hl-b) {
		color: var(--blue);
	}
	:global(button, input) {
		font-family: 'Inter', 'Noto Sans KR', sans-serif;
	}
	:global(.btn) {
		color: inherit;
		padding: 8px 16px;
	}
	:global(.no-deco) {
		color: inherit;
	}
	:global(.no-deco):hover {
		color: inherit;
		text-decoration: none;
	}
	:global(a) {
		text-decoration: none;
		color: var(--blue);
	}
	:global(a):hover {
		text-decoration: underline;
	}
	:global(.mx-auto) {
		margin-left: auto;
		margin-right: auto;
	}
	:global(i) {
		vertical-align: middle;
		padding: 0 1.6px;
	}
</style>

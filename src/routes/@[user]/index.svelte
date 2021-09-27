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
	import { getProfile } from '$lib/account';

	import fetchApiServer from '$lib/backend/fetch';
	import Badge from '../../components/badge.svelte';

	export let user;

	let uploading = false;

	async function loadUser() {
		const res = await fetchApiServer(`/account/profilebynick?nickname=${user}`);
		// console.log(res);
		return res;
	}
	async function upload() {
		if (inputtext) {
			uploading = true;
			const u = await getProfile();
			await fetchApiServer(`/upload/${user}?by=${await u.user.id}&nickname=${u.profile.nickname}&content=${inputtext}`);

			window.location.reload();
		}
	}
	let promise = loadUser();
	let inputtext = '';
</script>

{#await promise then res}
	{#if res.id === null}
		User Not Found
	{:else}
		<div class="user-container">
			<div class="user">
				<div class="name">
					{res.nickname}
				</div>
				<div class="about">
					{res.about}
				</div>
			</div>
			<div class="post">
				<div class="form">
					<input bind:value={inputtext} type="text" placeholder="{res.nickname}님에게 전하고 싶은 말을 입력하세요." />
					<button on:click={upload}>게시</button>
				</div>
				{#each res.data.reverse() as p, index}
					<div class="card" id="post-{res.data.length - index}-{p.nick}">
						<div class="title">
							{p.nick}
							{#if res.data.length - index === 1}
								<Badge># {res.data.length - index}</Badge>
							{:else if res.data.length - index === 2}
								<Badge># {res.data.length - index}</Badge>
							{:else if res.data.length - index === 3}
								<Badge># {res.data.length - index}</Badge>
							{/if}
							{#if p.nick === res.nickname}
								<Badge>소유자</Badge>
							{/if}
						</div>
						<div class="content">
							{p.content}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
{/await}

<style lang="scss">
	.user-container {
		width: 100%;
		margin: 0 auto;
		.user {
			width: 100%;
			height: 120px;
			border-bottom: var(--theme-nav-color) solid 1.2px;
			padding: 15px 30px;
			text-align: center;
			.name {
				font-size: 1.75rem;
				font-weight: light;
			}
			.about {
				font-size: 0.95rem;
				color: var(--theme-gray);
			}
		}
		.post {
			margin-top: 25px;
			width: 55%;
			margin: 35px auto;
			.card {
				box-shadow: 0 0 2.2px var(--theme-nav-color);
				width: 100%;
				height: auto;
				padding: 17px 17px;
				border: var(--theme-nav-color) solid 1.5px;
				border-radius: 7.5px;
				margin: 35px 0;
				.title {
					font-size: 1rem;
					font-weight: bold;
				}
				.content {
					margin-top: 7px;
				}
			}
		}
		.form {
			margin: 45px auto;
			width: 100%;
			display: flex;
			input {
				margin-top: 15px;
				font-size: 13px;
				min-width: 90%;
				height: 38px;
				border-radius: 7px;
				padding: 0px 15px;
				outline: none;
				border: 1.5px solid var(--theme-nav-color);
				transition: all ease 0.2s 0s;
				color: var(--theme-color);
				background-color: var(--theme-background);
			}
			input:focus {
				border: 1.5px solid var(--blue);
				outline: none;
				transition: all ease 0.2s 0s;
			}
			button {
				margin-top: 15px;
				margin-left: 5px;
				width: 100%;
				border-radius: 5px;
				outline: none;
				border: none;
				height: 38px;
				background-color: var(--blue);
				color: #ffffff;
				font-weight: bold;
			}
		}
	}
</style>

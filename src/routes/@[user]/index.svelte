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
	import { ADMIN } from '../../constants/admin';
	import Badge from '../../components/badge.svelte';
	import getAgo from '$lib/time/ago';
	import linkParser from '$lib/parser/link';
	import userParser from '$lib/parser/user';

	export let user;

	let uploading = false;

	async function loadUser() {
		const res = await fetchApiServer(`/account/profilebynick?nickname=${user}`);

		return res;
	}
	async function upload() {
		console.log(uploading);
		if (inputtext && !uploading) {
			uploading = true;
			const u = await getProfile();
			if (u.profile.id === null) {
				window.location.href = '/account/signin';
			}
			await fetchApiServer(`/upload/${user}?by=${await u.user.id}&nickname=${u.profile.nickname}&content=${inputtext}`);

			if (typeof window !== 'undefined') {
				window.location.reload();
			}
		}
	}
	async function follow() {
		const u = await getProfile();
		if (u.profile.id === null) {
			window.location.href = '/account/signin';
		}
		const res = await fetchApiServer(`/follow/${user}?by=${await u.user.id}`);
		if (typeof window !== 'undefined') {
			window.location.reload();
		}

		return res;
	}
	let promise = loadUser();
	let inputtext = '';
</script>

<svelte:head>
	<title>{user} - platform</title>
</svelte:head>

{#await promise then res}
	{#if res.id === null}
		User Not Found
	{:else}
		<div class="user-container">
			<div class="user">
				<div class="name">
					<a href="/@{res.nickname}" class="no-deco"> {res.nickname}</a>
					{#if ADMIN.includes(res.id)}
						<Badge>인증됨</Badge>
					{/if}
				</div>
				<div class="about">
					{res.about}
				</div>
			</div>
			<div class="main-content">
				<div class="show">
					<div class="show-title">소개</div>
					<div class="show-content">
						<div class="show-follow">
							팔로워 <span class="show-bold">{res.follower.length}</span>
						</div>
						<div class="show-follow">
							팔로잉 <span class="show-bold">{res.following.length}</span>
						</div>
						<div class="show-follow">
							전체 글 <span class="show-bold">{res.data.length}</span>
						</div>
						<button on:click={follow} class="show-button">Follow</button>
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
								<a href="/@{p.nick}/gg" class="no-deco">{p.nick}</a>{' '}
								<span class="time">{getAgo(p.time)}</span>
							</div>
							<div class="content">
								{@html userParser(linkParser(p.content))}
							</div>
						</div>
					{/each}
				</div>
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
		.main-content {
			display: flex;
			margin-top: 25px;
			width: 75%;
			margin: 35px auto;
			word-break: break-all;
			.show {
				margin-top: 60px;
				margin-right: 5%;
				width: 30%;
				height: 220px;
				border-radius: 15px;
				border: 0.1px solid var(--theme-nav-color);
				box-shadow: 0 0 1px var(--theme-nav-color);
				padding: 15px 22.5px;
				.show-title {
					font-weight: bold;
					font-size: 1.225rem;
				}
				.show-content {
					margin-top: 15px;
				}
				.show-follow {
					margin-bottom: 5px;
				}
				.show-bold {
					font-weight: bold;
				}
				.show-button {
					margin-top: 18px;
					width: 100%;
					height: 35px;
					border-radius: 7px;
					outline: none;
					border: none;
					background-color: var(--theme-nav-color);
					transition: all ease 0.2s 0s;
				}
				.show-button:hover {
					border: none;
					background-color: var(--theme-nav-color-hover);
					transition: all ease 0.2s 0s;
				}
			}
			.post {
				width: 70%;
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
						.time {
							font-weight: lighter;
							font-size: 0.75rem;
							color: var(--theme-gray);
							padding-left: 2px;
						}
					}
					.content {
						margin-top: 7px;
					}
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

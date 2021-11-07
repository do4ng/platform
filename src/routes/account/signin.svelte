<script lang="ts">
	import { getProfile } from '$lib/account';

	import signin from '$lib/account/signin';

	let email: string = '';
	let password: string = '';

	async function login() {
		let log = await signin(email, password);
		if (log.error) {
			document.getElementById('loginerror').style.visibility = 'visible';
		} else {
			if (typeof window !== 'undefined') {
				let usr = await getProfile();
				localStorage.setItem('nickname', usr.profile.nickname);
				window.location.href = '/';
			}
		}
	}
</script>

<svelte:head>
	<title>Signin - Platform</title>
</svelte:head>

<div class="logincard">
	<div class="logincardcontent">
		<div class="welcomecontent">환영합니다</div>
		<div class="content">
			친구들과 추억을 만들기 전, 먼저 로그인을 진행해주세요.
			<div class="signup">계정이 없으신가요? <a href="/account/signup">계정 만들기</a></div>
		</div>
		<div class="form">
			<input bind:value={email} type="text" placeholder="email *" />
			<input bind:value={password} type="password" placeholder="password *" />
		</div>
		<div class="confirm">
			<div class="error" id="loginerror">이메일 또는 비밀번호가 틀립니다.</div>
			<button class="btn indexbtn" on:click={login}>
				<span class="btnwhite">로그인</span>
			</button>
		</div>
	</div>
</div>

<style lang="scss">
	.logincard {
		width: 400px;
		height: 600px;
		background-color: #ffffff;
		border: var(--theme-nav-color) solid 2px;
		border-radius: 5px;
		margin: 0 auto;
		justify-content: center;
		color: #000000;
	}
	.logincardcontent {
		padding: 15px 20px;
		.welcomecontent {
			margin-top: 50px;
			font-size: 1.75rem;
			text-align: center;
		}
		.content {
			margin-top: 10px;
			color: #696969;
			font-size: 0.85rem;
			text-align: center;
		}
		.form {
			margin: 45px auto;
			width: 90%;
			input {
				margin-top: 15px;
				font-size: 13px;
				width: 100%;
				height: 38px;
				border-radius: 7px;
				padding: 0px 15px;
				outline: none;
				border: 1.5px solid var(--theme-nav-color);
				transition: all ease 0.2s 0s;
			}
			input:focus {
				border: 1.5px solid var(--blue);
				outline: none;
				transition: all ease 0.2s 0s;
			}
		}
		.confirm {
			padding-top: 15px;
			margin: 0 auto;
			width: 90%;
			.error {
				font-size: 13px;
				color: #ff8c8c;
				visibility: hidden;
			}
			.indexbtn {
				margin-top: 5px;
				border: none;
				cursor: pointer;
				width: 100%;
				background-color: var(--blue);
				border-radius: 5px;
			}
			.btnwhite {
				font-weight: bold;
				color: #ffffff;
			}
		}
	}
</style>

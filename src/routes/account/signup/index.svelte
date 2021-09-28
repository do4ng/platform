<script lang="ts">
	import signup from '$lib/account/signup';
	import user from '$lib/account/user';
	import fetchApiServer from '$lib/backend/fetch';

	let email: string = '';
	let password: string = '';
	let retypepassword: string = '';
	let nickname: string = '';
	let about: string = '';

	let level: number = 1;

	let message: string = '이미 존재하는 계정입니다.';

	const show = () => {
		document.getElementById('loginerror').style.visibility = 'visible';
	};

	const hide = () => {
		document.getElementById('loginerror').style.visibility = 'hidden';
	};

	async function login() {
		hide();
		const d = await await await signup(email, password);
		const exists = await fetchApiServer(`/account/profilebynick?nickname=${nickname.trim()}`);
		if (nickname === '') {
			message = '닉네임을 설정해주세요.';
			show();
		} else if (exists.id !== null) {
			message = '이미 존재하는 닉네임입니다. 다른 닉네임을 선택해주세요.';
			show();
		} else if (d.error) {
			message = '이미 존재하는 계정입니다.';
			show();
		} else {
			await fetchApiServer(`/account/create?id=${d.user.id}&nickname=${nickname}&about=${about}`);
			level = 3;
		}
	}
	function next() {
		if (email === '' || password === '' || retypepassword === '') {
			message = '필수 입력란을 채워주세요.';
			show();
		} else if (password.trim() !== retypepassword.trim()) {
			message = '비밀번호가 올바르지 않습니다.';
			show();
		} else {
			level = 2;
		}
	}
</script>

<svelte:head>
	<title>Signup - Platform</title>
</svelte:head>

<div class="logincard">
	<div class="logincardcontent">
		{#if level === 1}
			<div class="welcomecontent">환영합니다</div>
			<div class="content">
				친구들의 마음을 보기 위해서는 계정이 필요해요!
				<div class="signup">
					계정이 이미 있으신가요? <a href="/account/signin">로그인</a>
				</div>
			</div>
			<div class="form">
				<input bind:value={email} type="text" placeholder="email *" />
				<input bind:value={password} type="password" placeholder="password *" />
				<input bind:value={retypepassword} type="password" placeholder="retype password *" />
			</div>
			<div class="confirm">
				<div class="error" id="loginerror">{message}</div>
				<button class="btn indexbtn" on:click={next}>
					<span class="btnwhite">다음 단계</span>
				</button>
			</div>
		{:else if level === 2}
			<div class="welcomecontent">프로필 설정</div>
			<div class="content">
				거의 끝났습니다!
				<div class="signup">
					이용약관을 확인해주세요. <a href="/policy">이용약관</a>
				</div>
			</div>
			<div class="form">
				<input bind:value={nickname} type="text" placeholder="nickname *" />
				<input bind:value={about} type="text" placeholder="about me" />
			</div>
			<div class="confirm">
				<div class="error" id="loginerror">{message}</div>
				<button class="btn indexbtn" on:click={login}>
					<span class="btnwhite">회원가입</span>
				</button>
			</div>
		{:else}
			<div class="welcomecontent">끝났습니다</div>
			<div class="content">이메일을 확인해주세요!</div>
		{/if}
	</div>
</div>

<style lang="scss">
	.logincard {
		width: 400px;
		height: 600px;
		background-color: #ffffff;
		border: var(--theme-nav-color) solid 2px;
		border-radius: 7px;
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

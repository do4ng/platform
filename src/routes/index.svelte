<script lang="ts">
	import { getProfile } from '$lib/account';
	(async function () {
		const u = await getProfile();
	})();
</script>

<svelte:head>
	<title>친구들과 함께 행복한 추억을 쌓으세요.</title>
</svelte:head>

<div class="index">
	<div class="indexhead">
		<div class="indexhead1">
			<div class="indextitle">
				<span class="hl-b">친구들과</span>
				함께 행복한
				<span class="hl-b">추억을</span>
				쌓으세요.
			</div>
			<div class="indexcontent">
				대상에게 공개적으로 하고 싶었던 말을 꺼리낌없이 하세요. facebook의 타임라인과 흡사합니다! 대상이 익명을 허용하면
				로그인 없이도 마음을 전할 수 있습니다.
			</div>
		</div>
	</div>
	<div class="indexstart">
		<a href="/api/dashboard" class="no-deco">
			<button class="btn indexbtn">
				<span class="btnwhite">대시보드</span>
			</button>
		</a>
	</div>
</div>

<style lang="scss">
	.index {
		padding-top: 125px;
		width: 90%;
		margin: 0 auto;
	}
	.indextitle {
		font-size: 2.75rem;
		width: 40%;
		display: block;
		word-break: keep-all;
		line-height: 45px;
	}
	.indexhead1 {
		margin: 0;
	}
	.indexcontent {
		margin-top: 15px;
		color: var(--theme-gray);
		width: 40%;
		word-break: keep-all;
	}
	.indexhead {
		display: flex;
	}
	.indexstart {
		margin-top: 45px;
	}
	.indexbtn {
		border: none;
		cursor: pointer;
		background-color: var(--blue);
		border-radius: 5px;
	}
	.btnwhite {
		font-weight: bold;
		color: #ffffff;
	}
</style>

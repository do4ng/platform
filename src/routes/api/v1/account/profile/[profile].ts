import db from '$lib/db.dev';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get({ params }) {
	const { profile } = params;

	const { data } = await db.from('users').select();

	let input = null;

	data.forEach((e) => {
		if (e.nickname === profile) {
			input = e;
		}
	});

	return {
		body: input
	};
}

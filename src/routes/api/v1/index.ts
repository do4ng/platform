import db from '$lib/db.dev';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function get() {
	return {
		body: {
			msg: 'Api V1 Alive!'
		}
	};
}

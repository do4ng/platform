import { InfoLog } from '$lib/console';
import db from '$lib/db.dev';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post({ body }: { body: string }) {
	const r: { id: string; nickname: string; about: string } = JSON.parse(body);

	InfoLog('Created New User', `data: ${JSON.stringify(r)}`);

	const { data } = await db.from('users').upsert({
		id: r.id,
		nickname: r.nickname,
		about: r.about
	});

	return {
		body: data
	};
}

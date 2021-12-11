import { getProfile } from '$lib/account';
import { getEndpointProfile } from '$lib/account-endpoint';
import db from '$lib/db.dev';
import type { RequestHandler } from '@sveltejs/kit';
import getTime from '$lib/time/get';
import type { Profile } from 'src/interfaces/profile';
import { InfoLog } from '$lib/console';

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post({ body, params }: { body: any; params: { user: string } }) {
	const { data } = await db.from('users').select();
	let user = null;
	data.forEach((e: Profile) => {
		if (e.nickname == params.user) {
			user = e;
		}
	});

	// console.log(body);

	body = JSON.parse(body);

	if (user) {
		const me = await getEndpointProfile(body.req, body.base);
		InfoLog(
			'Created New Post',
			`from: ${me.profile.nickname} (${me.profile.id})\n  to: ${user.nickname} (${user.id})\n  content: ${body.content}`
		);
		user.data.push({ by: me.profile.id, nick: me.profile.nickname, content: body.content, time: getTime() });

		// console.log(user);

		const { data, error } = await db.from('users').upsert({ id: user.id, data: user.data });
	}

	return {
		body: user
	};
}

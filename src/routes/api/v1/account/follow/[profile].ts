import { getProfile } from '$lib/account';
import { getEndpointProfile } from '$lib/account-endpoint';
import { InfoLog } from '$lib/console';
import db from '$lib/db.dev';
import type { Profile } from 'src/interfaces/profile';

function removeArrayKey(arr, value) {
	var i = 0;
	while (i < arr.length) {
		if (arr[i] === value) {
			arr.splice(i, 1);
		} else {
			++i;
		}
	}
	return arr;
}

/** @type {import('@sveltejs/kit').RequestHandler} */
export async function post({ params, body }) {
	const { profile } = params;

	const { data } = await db.from('users').select();

	let input: Profile = null;

	body = JSON.parse(body);

	data.forEach((e: Profile) => {
		if (e.nickname === profile) {
			input = e;
		}
	});

	if (input) {
		let me = await getEndpointProfile(body.req);

		if (input.follower.includes(me.profile.id)) {
			// Unfollow

			input.follower = removeArrayKey(input.follower, me.profile.id);

			await db.from('users').upsert({ id: input.id, follower: input.follower });

			me.profile.following = removeArrayKey(me.profile.following, input.id);

			await db.from('users').upsert({ id: me.profile.id, following: me.profile.following });

			InfoLog(
				`unfollowed user`,
				`from: ${me.profile.nickname} (${me.profile.id})\n  to: ${input.nickname} (${input.id})`
			);
		} else {
			// Follow

			input.follower.push(me.profile.id);

			await db.from('users').upsert({ id: input.id, follower: input.follower });

			me.profile.following.push(input.id);

			await db.from('users').upsert({ id: me.profile.id, following: me.profile.following });
			InfoLog(
				`followed user`,
				`from: ${me.profile.nickname} (${me.profile.id})\n  to: ${input.nickname} (${input.id})`
			);
		}
	}

	return {
		body: input
	};
}

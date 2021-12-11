/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import supabase from '$lib/db';

export default async function endpointuser(cookie) {
	return await (
		await supabase.auth.api.getUser(cookie)
	).user;
}

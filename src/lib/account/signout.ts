/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import supabase from '$lib/db';

export default async function signout() {
	return await supabase.auth.signOut();
}

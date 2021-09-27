/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import supabase from '$lib/db';

export default function user() {
	return supabase.auth.user();
}

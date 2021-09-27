/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import supabase from '$lib/db';

export default async function signin(email: string, password: string) {
	return await supabase.auth.signIn({ email, password });
}

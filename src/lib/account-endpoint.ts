import type { User } from '@supabase/gotrue-js';
import type { Profile } from 'src/interfaces/profile';
import endpointuser from './account/endpointUser';
import profile from './profile';

export async function getEndpointProfile(
	cookie,
	base = 'http://localhost:3000'
): Promise<{ user: User; profile: Profile }> {
	const u = await endpointuser(JSON.parse(cookie).currentSession.access_token);
	const pf = await profile(u ? u.id : 'null', base);
	return { user: u, profile: pf };
}

import type { User } from '@supabase/gotrue-js';
import type { Profile } from 'src/interfaces/profile';
import user from './account/user';
import profile from './profile';

export async function getProfile(): Promise<{ user: User; profile: Profile }> {
	const u = user();
	return { user: u, profile: await profile(u ? u.id : 'null') };
}

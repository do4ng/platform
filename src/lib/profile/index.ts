import fetchApiServer from '$lib/backend/fetch';
import type { Profile } from 'src/interfaces/profile';

export default async function profile(id: string): Promise<Profile> {
	return await fetchApiServer(`/account/profile?id=${id}`);
}

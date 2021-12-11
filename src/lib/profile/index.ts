import fetchApiServer from '$lib/backend/fetch';
import type { Profile } from 'src/interfaces/profile';

export default async function profile(id: string, base: string = 'http://localhost:3000'): Promise<Profile> {
	return await fetchApiServer(`/account/id/${id}`, base);
}

import { BASE_URL } from '../../constants/config';

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function postApiServer(
	address: string,
	base: string = 'http://localhost:3000',
	data: object
): Promise<any> {
	let r: any;
	await fetch(`${base}/api/v1${address}`, { method: 'POST', body: JSON.stringify(data) })
		.then((res) => res.json())
		.then((data) => (r = data));
	return r;
}

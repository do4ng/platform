/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function fetchApiServer(address: string, base = 'http://localhost:3000'): Promise<any> {
	let r: any;

	await fetch(`${base}/api/v1${address}`)
		.then((res) => res.json())
		.then((data) => (r = data));
	return r;
}

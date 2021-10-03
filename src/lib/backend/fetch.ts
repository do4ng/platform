/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function fetchApiServer(address: string): Promise<any> {
	let r: any;
	/*
	await fetch(`https://kdmplatform.herokuapp.com${address}`)
		.then((res) => res.json())
		.then((data) => (r = data));
		*/
	await fetch(`http://localhost:4000${address}`)
		.then((res) => res.json())
		.then((data) => (r = data));
	return r;
}

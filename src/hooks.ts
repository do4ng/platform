export const handle = async ({ request, resolve }) => {
	const response = await resolve(request);
	// console.log(response);
	return {
		...response,
		headers: {
			...response.headers
		}
	};
};

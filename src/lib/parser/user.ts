export default function userParser(str: string): string {
	const matches = str.match(/[@]\S+/gi) || [];
	matches.forEach((e) => {
		str = str.replace(e, `<a href="/${e}/gg">${e}</a>`);
	});
	return str;
}

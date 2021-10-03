export default function linkParser(str: string): string {
	const matches = str.match(/\bhttps?:\/\/\S+/gi) || [];
	matches.forEach((e) => {
		str = str.replace(e, `<a href="${e}">${e}</a>`);
	});
	return str;
}

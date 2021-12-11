import 'colors';
export function FetchLog(type: 'POST' | 'GET', title: string, description: string) {
	console.log(`${` ${type} `.bgGreen.black.bold} ${title}\n  ${description.gray}\n`);
}
export function InfoLog(title: string, description: string) {
	console.log(`${' INFO '.bgBlue.white.bold} ${title}\n  ${description.gray}\n`);
}
export function ErrorLog(title: string, description: string) {
	console.log(`${' ERROR '.bgRed.white.bold} ${title}\n  ${description.gray}\n`);
}

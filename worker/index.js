import * as fs from 'fs';
import hash_sum from 'hash-sum';
import * as path from 'path';
if (fs.existsSync('./static/__build')) {
	fs.rmSync('./static/__build', { recursive: true });
}
fs.mkdirSync('./static/__build');
let html = fs.readFileSync(path.join('./index.html')).toString();
let builds = [];
fs.readdirSync(path.join('./assets')).forEach((e) => {
	let hs = hash_sum(`${new Date()}-${e}`);
	builds.push(`<script src="__build/${hs}.js"></script>`);
	fs.writeFileSync(path.join(`./static/__build/${hs}.js`), fs.readFileSync(`./assets/${e}`).toString());
});
html = html.replace('%platform.scripts%', builds.join('\n'));
fs.writeFileSync(path.join('./src/app.html'), html);

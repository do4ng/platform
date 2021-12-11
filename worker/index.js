import * as fs from 'fs';
import hash_sum from 'hash-sum';
import * as path from 'path';

function d(p) {
	if (!fs.existsSync(p)) {
		fs.mkdirSync(p);
	}
}

if (fs.existsSync('./static/__build')) {
	fs.rmSync('./static/__build', { recursive: true });
}
fs.mkdirSync('./static/__build');
let html = fs.readFileSync(path.join('./index.html')).toString();
let builds = [];
// init
d('./static/__build/assets');
d('./static/__build/global');
d('./static/__build/assets/js');
d('./static/__build/assets/css');
d('./static/__build/assets/img');
fs.readdirSync(path.join('./assets')).forEach((e) => {
	if (e.endsWith('.js')) {
		if (e.startsWith('g-')) {
			let hs = hash_sum(`${new Date()}-${e}`);
			builds.push(`<script src="__build/global/${hs}.global.js"></script>`);
			fs.writeFileSync(
				path.join(`./static/__build/global/${hs}.global.js`),
				fs.readFileSync(`./assets/${e}`).toString()
			);
		} else {
			let hs = hash_sum(`${new Date()}-${e}`);
			builds.push(`<script src="__build/assets/js/${hs}.js"></script>`);
			fs.writeFileSync(path.join(`./static/__build/assets/js/${hs}.js`), fs.readFileSync(`./assets/${e}`).toString());
		}
	}
});
html = html.replace('%platform.scripts%', builds.join('\n'));
fs.writeFileSync(path.join('./src/app.html'), html);

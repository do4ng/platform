import { respond } from '@sveltejs/kit/ssr';
import root from './generated/root.svelte';
import { set_paths, assets } from './runtime/paths.js';
import { set_prerendering } from './runtime/env.js';
import * as user_hooks from "./hooks.js";

const template = ({ head, body }) => "<!DOCTYPE html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<link rel=\"icon\" href=\"/favicon.png\" />\n\t\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n\n\t\t" + head + "\n\t</head>\n\t<body class=\"theme-light\">\n\t\t<div id=\"__app__\">" + body + "</div>\n\t\t<script src=\"/js/th.js\"></script>\n\t</body>\n</html>\n";

let options = null;

const default_settings = { paths: {"base":"","assets":""} };

// allow paths to be overridden in svelte-kit preview
// and in prerendering
export function init(settings = default_settings) {
	set_paths(settings.paths);
	set_prerendering(settings.prerendering || false);

	const hooks = get_hooks(user_hooks);

	options = {
		amp: false,
		dev: false,
		entry: {
			file: assets + "/_app/start-32932a60.js",
			css: [assets + "/_app/assets/start-61d1577b.css"],
			js: [assets + "/_app/start-32932a60.js",assets + "/_app/chunks/vendor-35612e70.js"]
		},
		fetched: undefined,
		floc: false,
		get_component_path: id => assets + "/_app/" + entry_lookup[id],
		get_stack: error => String(error), // for security
		handle_error: (error, request) => {
			hooks.handleError({ error, request });
			error.stack = options.get_stack(error);
		},
		hooks,
		hydrate: true,
		initiator: undefined,
		load_component,
		manifest,
		paths: settings.paths,
		prerender: true,
		read: settings.read,
		root,
		service_worker: null,
		router: true,
		ssr: true,
		target: "#__app__",
		template,
		trailing_slash: "never"
	};
}

// input has already been decoded by decodeURI
// now handle the rest that decodeURIComponent would do
const d = s => s
	.replace(/%23/g, '#')
	.replace(/%3[Bb]/g, ';')
	.replace(/%2[Cc]/g, ',')
	.replace(/%2[Ff]/g, '/')
	.replace(/%3[Ff]/g, '?')
	.replace(/%3[Aa]/g, ':')
	.replace(/%40/g, '@')
	.replace(/%26/g, '&')
	.replace(/%3[Dd]/g, '=')
	.replace(/%2[Bb]/g, '+')
	.replace(/%24/g, '$');

const empty = () => ({});

const manifest = {
	assets: [{"file":"favicon.png","size":1571,"type":"image/png"},{"file":"js/th.js","size":386,"type":"application/javascript"},{"file":"robots.txt","size":67,"type":"text/plain"},{"file":"svelte-welcome.png","size":360807,"type":"image/png"},{"file":"svelte-welcome.webp","size":115470,"type":"image/webp"}],
	layout: "src/routes/__layout.svelte",
	error: "src/routes/__error.svelte",
	routes: [
		{
						type: 'page',
						pattern: /^\/$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/account\/setting\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/account/setting/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/account\/setting\/([^/]+?)\/?$/,
						params: (m) => ({ page: d(m[1])}),
						a: ["src/routes/__layout.svelte", "src/routes/account/setting/[page].svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/account\/signout\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/account/signout.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/account\/signin\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/account/signin.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/account\/signup\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/account/signup/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/explore\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/explore/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/policy\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/policy/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/api\/dashboard\/?$/,
						params: empty,
						a: ["src/routes/__layout.svelte", "src/routes/api/dashboard.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/@([^/]+?)\/?$/,
						params: (m) => ({ user: d(m[1])}),
						a: ["src/routes/__layout.svelte", "src/routes/@[user]/index.svelte"],
						b: ["src/routes/__error.svelte"]
					},
		{
						type: 'page',
						pattern: /^\/@([^/]+?)\/gg\/?$/,
						params: (m) => ({ user: d(m[1])}),
						a: ["src/routes/__layout.svelte", "src/routes/@[user]/gg.svelte"],
						b: ["src/routes/__error.svelte"]
					}
	]
};

// this looks redundant, but the indirection allows us to access
// named imports without triggering Rollup's missing import detection
const get_hooks = hooks => ({
	getSession: hooks.getSession || (() => ({})),
	handle: hooks.handle || (({ request, resolve }) => resolve(request)),
	handleError: hooks.handleError || (({ error }) => console.error(error.stack)),
	externalFetch: hooks.externalFetch || fetch
});

const module_lookup = {
	"src/routes/__layout.svelte": () => import("..\\..\\src\\routes\\__layout.svelte"),"src/routes/__error.svelte": () => import("..\\..\\src\\routes\\__error.svelte"),"src/routes/index.svelte": () => import("..\\..\\src\\routes\\index.svelte"),"src/routes/account/setting/index.svelte": () => import("..\\..\\src\\routes\\account\\setting\\index.svelte"),"src/routes/account/setting/[page].svelte": () => import("..\\..\\src\\routes\\account\\setting\\[page].svelte"),"src/routes/account/signout.svelte": () => import("..\\..\\src\\routes\\account\\signout.svelte"),"src/routes/account/signin.svelte": () => import("..\\..\\src\\routes\\account\\signin.svelte"),"src/routes/account/signup/index.svelte": () => import("..\\..\\src\\routes\\account\\signup\\index.svelte"),"src/routes/explore/index.svelte": () => import("..\\..\\src\\routes\\explore\\index.svelte"),"src/routes/policy/index.svelte": () => import("..\\..\\src\\routes\\policy\\index.svelte"),"src/routes/api/dashboard.svelte": () => import("..\\..\\src\\routes\\api\\dashboard.svelte"),"src/routes/@[user]/index.svelte": () => import("..\\..\\src\\routes\\@[user]\\index.svelte"),"src/routes/@[user]/gg.svelte": () => import("..\\..\\src\\routes\\@[user]\\gg.svelte")
};

const metadata_lookup = {"src/routes/__layout.svelte":{"entry":"pages/__layout.svelte-00c92930.js","css":["assets/pages/__layout.svelte-1f68a8fa.css"],"js":["pages/__layout.svelte-00c92930.js","chunks/vendor-35612e70.js"],"styles":[]},"src/routes/__error.svelte":{"entry":"pages/__error.svelte-a264a667.js","css":["assets/pages/__error.svelte-5ae2582c.css"],"js":["pages/__error.svelte-a264a667.js","chunks/vendor-35612e70.js"],"styles":[]},"src/routes/index.svelte":{"entry":"pages/index.svelte-2981667d.js","css":["assets/pages/index.svelte-cf3f0c3a.css"],"js":["pages/index.svelte-2981667d.js","chunks/vendor-35612e70.js","chunks/account-a378f0ad.js","chunks/db-cdcd9140.js","chunks/fetch-1db0cb0a.js"],"styles":[]},"src/routes/account/setting/index.svelte":{"entry":"pages/account/setting/index.svelte-9bc5981e.js","css":[],"js":["pages/account/setting/index.svelte-9bc5981e.js","chunks/vendor-35612e70.js"],"styles":[]},"src/routes/account/setting/[page].svelte":{"entry":"pages/account/setting/[page].svelte-71dfeb0d.js","css":["assets/pages/account/setting/[page].svelte-3c6dd372.css"],"js":["pages/account/setting/[page].svelte-71dfeb0d.js","chunks/vendor-35612e70.js"],"styles":[]},"src/routes/account/signout.svelte":{"entry":"pages/account/signout.svelte-5f6cbaf4.js","css":[],"js":["pages/account/signout.svelte-5f6cbaf4.js","chunks/vendor-35612e70.js","chunks/db-cdcd9140.js"],"styles":[]},"src/routes/account/signin.svelte":{"entry":"pages/account/signin.svelte-8dd5a61b.js","css":["assets/pages/account/signin.svelte-32491672.css"],"js":["pages/account/signin.svelte-8dd5a61b.js","chunks/vendor-35612e70.js","chunks/db-cdcd9140.js"],"styles":[]},"src/routes/account/signup/index.svelte":{"entry":"pages/account/signup/index.svelte-bd3ac4dc.js","css":["assets/pages/account/signup/index.svelte-237a7981.css"],"js":["pages/account/signup/index.svelte-bd3ac4dc.js","chunks/vendor-35612e70.js","chunks/db-cdcd9140.js","chunks/fetch-1db0cb0a.js"],"styles":[]},"src/routes/explore/index.svelte":{"entry":"pages/explore/index.svelte-ad9df1cf.js","css":[],"js":["pages/explore/index.svelte-ad9df1cf.js","chunks/vendor-35612e70.js"],"styles":[]},"src/routes/policy/index.svelte":{"entry":"pages/policy/index.svelte-4df72076.js","css":[],"js":["pages/policy/index.svelte-4df72076.js","chunks/vendor-35612e70.js"],"styles":[]},"src/routes/api/dashboard.svelte":{"entry":"pages/api/dashboard.svelte-48245b5e.js","css":[],"js":["pages/api/dashboard.svelte-48245b5e.js","chunks/vendor-35612e70.js","chunks/account-a378f0ad.js","chunks/db-cdcd9140.js","chunks/fetch-1db0cb0a.js"],"styles":[]},"src/routes/@[user]/index.svelte":{"entry":"pages/@[user]/index.svelte-3af0e722.js","css":["assets/pages/@[user]/index.svelte-607fad7f.css"],"js":["pages/@[user]/index.svelte-3af0e722.js","chunks/vendor-35612e70.js","chunks/account-a378f0ad.js","chunks/db-cdcd9140.js","chunks/fetch-1db0cb0a.js"],"styles":[]},"src/routes/@[user]/gg.svelte":{"entry":"pages/@[user]/gg.svelte-ff427ac2.js","css":[],"js":["pages/@[user]/gg.svelte-ff427ac2.js","chunks/vendor-35612e70.js"],"styles":[]}};

async function load_component(file) {
	const { entry, css, js, styles } = metadata_lookup[file];
	return {
		module: await module_lookup[file](),
		entry: assets + "/_app/" + entry,
		css: css.map(dep => assets + "/_app/" + dep),
		js: js.map(dep => assets + "/_app/" + dep),
		styles
	};
}

export function render(request, {
	prerender
} = {}) {
	const host = request.headers["host"];
	return respond({ ...request, host }, options, { prerender });
}
const c = [
	() => import("../../../src/routes/__layout.svelte"),
	() => import("../../../src/routes/__error.svelte"),
	() => import("../../../src/routes/index.svelte"),
	() => import("../../../src/routes/account/signout.svelte"),
	() => import("../../../src/routes/account/signin.svelte"),
	() => import("../../../src/routes/account/signup/index.svelte"),
	() => import("../../../src/routes/policy/index.svelte"),
	() => import("../../../src/routes/api/dashboard.svelte"),
	() => import("../../../src/routes/@[user]/index.svelte"),
	() => import("../../../src/routes/@[user]/share/[post].svelte"),
	() => import("../../../src/routes/@[user]/gg.svelte")
];

const d = decodeURIComponent;

export const routes = [
	// src/routes/index.svelte
	[/^\/$/, [c[0], c[2]], [c[1]]],

	// src/routes/account/signout.svelte
	[/^\/account\/signout\/?$/, [c[0], c[3]], [c[1]]],

	// src/routes/account/signin.svelte
	[/^\/account\/signin\/?$/, [c[0], c[4]], [c[1]]],

	// src/routes/account/signup/index.svelte
	[/^\/account\/signup\/?$/, [c[0], c[5]], [c[1]]],

	// src/routes/policy/index.svelte
	[/^\/policy\/?$/, [c[0], c[6]], [c[1]]],

	// src/routes/api/dashboard.svelte
	[/^\/api\/dashboard\/?$/, [c[0], c[7]], [c[1]]],

	// src/routes/@[user]/index.svelte
	[/^\/@([^/]+?)\/?$/, [c[0], c[8]], [c[1]], (m) => ({ user: d(m[1])})],

	// src/routes/@[user]/share/[post].svelte
	[/^\/@([^/]+?)\/share\/([^/]+?)\/?$/, [c[0], c[9]], [c[1]], (m) => ({ user: d(m[1]), post: d(m[2])})],

	// src/routes/@[user]/gg.svelte
	[/^\/@([^/]+?)\/gg\/?$/, [c[0], c[10]], [c[1]], (m) => ({ user: d(m[1])})]
];

// we import the root layout/error components eagerly, so that
// connectivity errors after initialisation don't nuke the app
export const fallback = [c[0](), c[1]()];
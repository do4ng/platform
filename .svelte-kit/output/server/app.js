var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
import { createClient } from "@supabase/supabase-js";
import TimeCounting from "time-counting";
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone = {};
  for (const key in obj) {
    clone[key.toLowerCase()] = obj[key];
  }
  return clone;
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler) {
    return;
  }
  const params = route.params(match);
  const response = await handler({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop$1() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
const subscriber_queue = [];
function writable(value, start = noop$1) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
const escape_json_string_in_html_dict = {
  '"': '\\"',
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape_json_string_in_html(str) {
  return escape$1(str, escape_json_string_in_html_dict, (code) => `\\u${code.toString(16).toUpperCase()}`);
}
const escape_html_attr_dict = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;"
};
function escape_html_attr(str) {
  return '"' + escape$1(str, escape_html_attr_dict, (code) => `&#${code};`) + '"';
}
function escape$1(str, dict, unicode_encoder) {
  let result = "";
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char in dict) {
      result += dict[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += unicode_encoder(code);
      }
    } else {
      result += char;
    }
  }
  return result;
}
const s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page && page.host ? s$1(page.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page && page.host ? s$1(page.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page && page.path)},
						query: new URLSearchParams(${page ? s$1(page.query.toString()) : ""}),
						params: ${page && s$1(page.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url=${escape_html_attr(url)}`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  if (loaded.context) {
    throw new Error('You are returning "context" from a load function. "context" was renamed to "stuff", please adjust your code accordingly.');
  }
  return loaded;
}
const s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page,
  node,
  $session,
  stuff,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":"${escape_json_string_in_html(body)}"}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      stuff: { ...stuff }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    stuff: loaded.stuff || stuff,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
const absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page,
    node: default_layout,
    $session,
    stuff: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page,
      node: default_error,
      $session,
      stuff: loaded ? loaded.stuff : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let stuff = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              stuff,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    stuff: node_loaded.stuff,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.stuff) {
          stuff = {
            ...stuff,
            ...loaded.loaded.stuff
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
class ReadOnlyFormData {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
}
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function noop() {
}
function is_promise(value) {
  return value && typeof value === "object" && typeof value.then === "function";
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
let current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
Promise.resolve();
const escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
const missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
let on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function afterUpdate() {
}
var root_svelte_svelte_type_style_lang = "";
const css$9 = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AAsDC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
const Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css$9);
  {
    stores.page.set(page);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
let base = "";
let assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module"
});
const template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="/favicon.png" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n\n		' + head + '\n	</head>\n	<body class="theme-light">\n		<div id="__app__">' + body + '</div>\n		<script src="/js/th.js"><\/script>\n	</body>\n</html>\n';
let options = null;
const default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-32932a60.js",
      css: [assets + "/_app/assets/start-61d1577b.css"],
      js: [assets + "/_app/start-32932a60.js", assets + "/_app/chunks/vendor-35612e70.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#__app__",
    template,
    trailing_slash: "never"
  };
}
const d = (s2) => s2.replace(/%23/g, "#").replace(/%3[Bb]/g, ";").replace(/%2[Cc]/g, ",").replace(/%2[Ff]/g, "/").replace(/%3[Ff]/g, "?").replace(/%3[Aa]/g, ":").replace(/%40/g, "@").replace(/%26/g, "&").replace(/%3[Dd]/g, "=").replace(/%2[Bb]/g, "+").replace(/%24/g, "$");
const empty = () => ({});
const manifest = {
  assets: [{ "file": "favicon.png", "size": 1571, "type": "image/png" }, { "file": "js/th.js", "size": 386, "type": "application/javascript" }, { "file": "robots.txt", "size": 67, "type": "text/plain" }, { "file": "svelte-welcome.png", "size": 360807, "type": "image/png" }, { "file": "svelte-welcome.webp", "size": 115470, "type": "image/webp" }],
  layout: "src/routes/__layout.svelte",
  error: "src/routes/__error.svelte",
  routes: [
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/account\/setting\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/account/setting/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/account\/setting\/([^/]+?)\/?$/,
      params: (m) => ({ page: d(m[1]) }),
      a: ["src/routes/__layout.svelte", "src/routes/account/setting/[page].svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/account\/signout\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/account/signout.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/account\/signin\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/account/signin.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/account\/signup\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/account/signup/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/explore\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/explore/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/policy\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/policy/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/api\/dashboard\/?$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/api/dashboard.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/@([^/]+?)\/?$/,
      params: (m) => ({ user: d(m[1]) }),
      a: ["src/routes/__layout.svelte", "src/routes/@[user]/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "page",
      pattern: /^\/@([^/]+?)\/gg\/?$/,
      params: (m) => ({ user: d(m[1]) }),
      a: ["src/routes/__layout.svelte", "src/routes/@[user]/gg.svelte"],
      b: ["src/routes/__error.svelte"]
    }
  ]
};
const get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
const module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  "src/routes/__error.svelte": () => Promise.resolve().then(function() {
    return __error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index$5;
  }),
  "src/routes/account/setting/index.svelte": () => Promise.resolve().then(function() {
    return index$4;
  }),
  "src/routes/account/setting/[page].svelte": () => Promise.resolve().then(function() {
    return _page_;
  }),
  "src/routes/account/signout.svelte": () => Promise.resolve().then(function() {
    return signout;
  }),
  "src/routes/account/signin.svelte": () => Promise.resolve().then(function() {
    return signin;
  }),
  "src/routes/account/signup/index.svelte": () => Promise.resolve().then(function() {
    return index$3;
  }),
  "src/routes/explore/index.svelte": () => Promise.resolve().then(function() {
    return index$2;
  }),
  "src/routes/policy/index.svelte": () => Promise.resolve().then(function() {
    return index$1;
  }),
  "src/routes/api/dashboard.svelte": () => Promise.resolve().then(function() {
    return dashboard;
  }),
  "src/routes/@[user]/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/@[user]/gg.svelte": () => Promise.resolve().then(function() {
    return gg;
  })
};
const metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-00c92930.js", "css": ["assets/pages/__layout.svelte-1f68a8fa.css"], "js": ["pages/__layout.svelte-00c92930.js", "chunks/vendor-35612e70.js"], "styles": [] }, "src/routes/__error.svelte": { "entry": "pages/__error.svelte-a264a667.js", "css": ["assets/pages/__error.svelte-5ae2582c.css"], "js": ["pages/__error.svelte-a264a667.js", "chunks/vendor-35612e70.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-2981667d.js", "css": ["assets/pages/index.svelte-cf3f0c3a.css"], "js": ["pages/index.svelte-2981667d.js", "chunks/vendor-35612e70.js", "chunks/account-a378f0ad.js", "chunks/db-cdcd9140.js", "chunks/fetch-1db0cb0a.js"], "styles": [] }, "src/routes/account/setting/index.svelte": { "entry": "pages/account/setting/index.svelte-9bc5981e.js", "css": [], "js": ["pages/account/setting/index.svelte-9bc5981e.js", "chunks/vendor-35612e70.js"], "styles": [] }, "src/routes/account/setting/[page].svelte": { "entry": "pages/account/setting/[page].svelte-71dfeb0d.js", "css": ["assets/pages/account/setting/[page].svelte-3c6dd372.css"], "js": ["pages/account/setting/[page].svelte-71dfeb0d.js", "chunks/vendor-35612e70.js"], "styles": [] }, "src/routes/account/signout.svelte": { "entry": "pages/account/signout.svelte-5f6cbaf4.js", "css": [], "js": ["pages/account/signout.svelte-5f6cbaf4.js", "chunks/vendor-35612e70.js", "chunks/db-cdcd9140.js"], "styles": [] }, "src/routes/account/signin.svelte": { "entry": "pages/account/signin.svelte-8dd5a61b.js", "css": ["assets/pages/account/signin.svelte-32491672.css"], "js": ["pages/account/signin.svelte-8dd5a61b.js", "chunks/vendor-35612e70.js", "chunks/db-cdcd9140.js"], "styles": [] }, "src/routes/account/signup/index.svelte": { "entry": "pages/account/signup/index.svelte-bd3ac4dc.js", "css": ["assets/pages/account/signup/index.svelte-237a7981.css"], "js": ["pages/account/signup/index.svelte-bd3ac4dc.js", "chunks/vendor-35612e70.js", "chunks/db-cdcd9140.js", "chunks/fetch-1db0cb0a.js"], "styles": [] }, "src/routes/explore/index.svelte": { "entry": "pages/explore/index.svelte-ad9df1cf.js", "css": [], "js": ["pages/explore/index.svelte-ad9df1cf.js", "chunks/vendor-35612e70.js"], "styles": [] }, "src/routes/policy/index.svelte": { "entry": "pages/policy/index.svelte-4df72076.js", "css": [], "js": ["pages/policy/index.svelte-4df72076.js", "chunks/vendor-35612e70.js"], "styles": [] }, "src/routes/api/dashboard.svelte": { "entry": "pages/api/dashboard.svelte-48245b5e.js", "css": [], "js": ["pages/api/dashboard.svelte-48245b5e.js", "chunks/vendor-35612e70.js", "chunks/account-a378f0ad.js", "chunks/db-cdcd9140.js", "chunks/fetch-1db0cb0a.js"], "styles": [] }, "src/routes/@[user]/index.svelte": { "entry": "pages/@[user]/index.svelte-3af0e722.js", "css": ["assets/pages/@[user]/index.svelte-607fad7f.css"], "js": ["pages/@[user]/index.svelte-3af0e722.js", "chunks/vendor-35612e70.js", "chunks/account-a378f0ad.js", "chunks/db-cdcd9140.js", "chunks/fetch-1db0cb0a.js"], "styles": [] }, "src/routes/@[user]/gg.svelte": { "entry": "pages/@[user]/gg.svelte-ff427ac2.js", "css": [], "js": ["pages/@[user]/gg.svelte-ff427ac2.js", "chunks/vendor-35612e70.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender });
}
var header_svelte_svelte_type_style_lang = "";
const css$8 = {
  code: ".header.svelte-1oo86cc{margin:0;width:100%}.header-main.svelte-1oo86cc{display:flex;align-items:center;position:sticky;width:100%;height:60px;border-bottom:var(--theme-nav-color) 1px solid;vertical-align:middle}.header-content.svelte-1oo86cc{max-width:1280px;width:90%;margin:0 auto}.header-title.svelte-1oo86cc{font-weight:bold;font-size:1.175rem}",
  map: '{"version":3,"file":"header.svelte","sources":["header.svelte"],"sourcesContent":["<div class=\\"header\\">\\r\\n\\t<slot />\\r\\n\\t<div class=\\"header-main\\">\\r\\n\\t\\t<div class=\\"header-content\\">\\r\\n\\t\\t\\t<div class=\\"header-title\\"><a href=\\"/\\" class=\\"no-deco\\">platform</a></div>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.header {\\n  margin: 0;\\n  width: 100%;\\n}\\n\\n.header-main {\\n  display: flex;\\n  align-items: center;\\n  position: sticky;\\n  width: 100%;\\n  height: 60px;\\n  border-bottom: var(--theme-nav-color) 1px solid;\\n  vertical-align: middle;\\n}\\n\\n.header-content {\\n  max-width: 1280px;\\n  width: 90%;\\n  margin: 0 auto;\\n}\\n\\n.header-title {\\n  font-weight: bold;\\n  font-size: 1.175rem;\\n}</style>\\r\\n"],"names":[],"mappings":"AASmB,OAAO,eAAC,CAAC,AAC1B,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,IAAI,AACb,CAAC,AAED,YAAY,eAAC,CAAC,AACZ,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,QAAQ,CAAE,MAAM,CAChB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,IAAI,iBAAiB,CAAC,CAAC,GAAG,CAAC,KAAK,CAC/C,cAAc,CAAE,MAAM,AACxB,CAAC,AAED,eAAe,eAAC,CAAC,AACf,SAAS,CAAE,MAAM,CACjB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,CAAC,CAAC,IAAI,AAChB,CAAC,AAED,aAAa,eAAC,CAAC,AACb,WAAW,CAAE,IAAI,CACjB,SAAS,CAAE,QAAQ,AACrB,CAAC"}'
};
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$8);
  return `<div class="${"header svelte-1oo86cc"}">${slots.default ? slots.default({}) : ``}
	<div class="${"header-main svelte-1oo86cc"}"><div class="${"header-content svelte-1oo86cc"}"><div class="${"header-title svelte-1oo86cc"}"><a href="${"/"}" class="${"no-deco"}">platform</a></div></div></div>
</div>`;
});
var __layout_svelte_svelte_type_style_lang = "";
const css$7 = {
  code: '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap");@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400&display=swap");.main.svelte-1srpya5{width:100%;max-width:1280px;margin:50px auto 0}body, html, #__app__{margin:0}:root{font-family:"Inter", "Noto Sans KR", sans-serif}.theme-dark{--theme-background:#161616;--theme-color:#ffffff;--theme-gray:#eeeeee;--theme-nav-color:#292929;--theme-nav-color-hover:#1a1a1a;--blue:#4ba0d9;--theme-button-gray:#383838}.theme-light{--theme-background:#ffffff;--theme-color:#000000;--theme-gray:rgb(122, 122, 122);--theme-button-gray:#d1d1d1;--theme-nav-color:#e2e2e2;--theme-nav-color-hover:#d3d3d3;--blue:#31acff}body{background-color:var(--theme-background);color:var(--theme-color)}*{box-sizing:border-box}.hl-b{color:var(--blue)}button, input{font-family:"Inter", "Noto Sans KR", sans-serif}.btn{color:inherit;padding:8px 16px}.no-deco{color:inherit}.no-deco:hover{color:inherit;text-decoration:none}a{text-decoration:none;color:var(--blue)}a:hover{text-decoration:underline}',
  map: `{"version":3,"file":"__layout.svelte","sources":["__layout.svelte"],"sourcesContent":["<script lang=\\"ts\\">import Header from '../components/header.svelte';\\r\\n<\/script>\\r\\n\\r\\n<Header />\\r\\n<div class=\\"main\\">\\r\\n\\t<slot />\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">@import url(\\"https://fonts.googleapis.com/css2?family=Inter:wght@400&display=swap\\");\\n@import url(\\"https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400&display=swap\\");\\n.main {\\n  width: 100%;\\n  max-width: 1280px;\\n  margin: 50px auto 0;\\n}\\n\\n:global(body, html, #__app__) {\\n  margin: 0;\\n}\\n\\n:root {\\n  font-family: \\"Inter\\", \\"Noto Sans KR\\", sans-serif;\\n}\\n\\n:global(.theme-dark) {\\n  /* dark theme */\\n  --theme-background: #161616;\\n  --theme-color: #ffffff;\\n  --theme-gray: #eeeeee;\\n  --theme-nav-color: #292929;\\n  --theme-nav-color-hover: #1a1a1a;\\n  --blue: #4ba0d9;\\n  --theme-button-gray: #383838;\\n}\\n\\n:global(.theme-light) {\\n  /* white theme */\\n  --theme-background: #ffffff;\\n  --theme-color: #000000;\\n  --theme-gray: rgb(122, 122, 122);\\n  --theme-button-gray: #d1d1d1;\\n  --theme-nav-color: #e2e2e2;\\n  --theme-nav-color-hover: #d3d3d3;\\n  --blue: #31acff;\\n}\\n\\n:global(body) {\\n  background-color: var(--theme-background);\\n  color: var(--theme-color);\\n}\\n\\n:global(*) {\\n  box-sizing: border-box;\\n}\\n\\n:global(.hl-b) {\\n  color: var(--blue);\\n}\\n\\n:global(button, input) {\\n  font-family: \\"Inter\\", \\"Noto Sans KR\\", sans-serif;\\n}\\n\\n:global(.btn) {\\n  color: inherit;\\n  padding: 8px 16px;\\n}\\n\\n:global(.no-deco) {\\n  color: inherit;\\n}\\n\\n:global(.no-deco):hover {\\n  color: inherit;\\n  text-decoration: none;\\n}\\n\\n:global(a) {\\n  text-decoration: none;\\n  color: var(--blue);\\n}\\n\\n:global(a):hover {\\n  text-decoration: underline;\\n}</style>\\r\\n"],"names":[],"mappings":"AAQmB,QAAQ,IAAI,sEAAsE,CAAC,CAAC,AACvG,QAAQ,IAAI,6EAA6E,CAAC,CAAC,AAC3F,KAAK,eAAC,CAAC,AACL,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,MAAM,CACjB,MAAM,CAAE,IAAI,CAAC,IAAI,CAAC,CAAC,AACrB,CAAC,AAEO,oBAAoB,AAAE,CAAC,AAC7B,MAAM,CAAE,CAAC,AACX,CAAC,AAED,KAAK,AAAC,CAAC,AACL,WAAW,CAAE,OAAO,CAAC,CAAC,cAAc,CAAC,CAAC,UAAU,AAClD,CAAC,AAEO,WAAW,AAAE,CAAC,AAEpB,kBAAkB,CAAE,OAAO,CAC3B,aAAa,CAAE,OAAO,CACtB,YAAY,CAAE,OAAO,CACrB,iBAAiB,CAAE,OAAO,CAC1B,uBAAuB,CAAE,OAAO,CAChC,MAAM,CAAE,OAAO,CACf,mBAAmB,CAAE,OAAO,AAC9B,CAAC,AAEO,YAAY,AAAE,CAAC,AAErB,kBAAkB,CAAE,OAAO,CAC3B,aAAa,CAAE,OAAO,CACtB,YAAY,CAAE,kBAAkB,CAChC,mBAAmB,CAAE,OAAO,CAC5B,iBAAiB,CAAE,OAAO,CAC1B,uBAAuB,CAAE,OAAO,CAChC,MAAM,CAAE,OAAO,AACjB,CAAC,AAEO,IAAI,AAAE,CAAC,AACb,gBAAgB,CAAE,IAAI,kBAAkB,CAAC,CACzC,KAAK,CAAE,IAAI,aAAa,CAAC,AAC3B,CAAC,AAEO,CAAC,AAAE,CAAC,AACV,UAAU,CAAE,UAAU,AACxB,CAAC,AAEO,KAAK,AAAE,CAAC,AACd,KAAK,CAAE,IAAI,MAAM,CAAC,AACpB,CAAC,AAEO,aAAa,AAAE,CAAC,AACtB,WAAW,CAAE,OAAO,CAAC,CAAC,cAAc,CAAC,CAAC,UAAU,AAClD,CAAC,AAEO,IAAI,AAAE,CAAC,AACb,KAAK,CAAE,OAAO,CACd,OAAO,CAAE,GAAG,CAAC,IAAI,AACnB,CAAC,AAEO,QAAQ,AAAE,CAAC,AACjB,KAAK,CAAE,OAAO,AAChB,CAAC,AAEO,QAAQ,AAAC,MAAM,AAAC,CAAC,AACvB,KAAK,CAAE,OAAO,CACd,eAAe,CAAE,IAAI,AACvB,CAAC,AAEO,CAAC,AAAE,CAAC,AACV,eAAe,CAAE,IAAI,CACrB,KAAK,CAAE,IAAI,MAAM,CAAC,AACpB,CAAC,AAEO,CAAC,AAAC,MAAM,AAAC,CAAC,AAChB,eAAe,CAAE,SAAS,AAC5B,CAAC"}`
};
const _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$7);
  return `${validate_component(Header, "Header").$$render($$result, {}, {}, {})}
<div class="${"main svelte-1srpya5"}">${slots.default ? slots.default({}) : ``}
</div>`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout
});
var __error_svelte_svelte_type_style_lang = "";
const css$6 = {
  code: ".pageerror.svelte-asfnn1{text-align:center;margin:15rem 0}.errortitle.svelte-asfnn1{font-size:1.25rem;font-weight:bold}.errormessage.svelte-asfnn1{margin-top:25px}",
  map: '{"version":3,"file":"__error.svelte","sources":["__error.svelte"],"sourcesContent":["<script context=\\"module\\">\\r\\n\\texport function load({ error, status }) {\\r\\n\\t\\treturn {\\r\\n\\t\\t\\tprops: {\\r\\n\\t\\t\\t\\ttitle: `${status}: ${error.message}`\\r\\n\\t\\t\\t}\\r\\n\\t\\t};\\r\\n\\t}\\r\\n<\/script>\\r\\n\\r\\n<script>\\r\\n\\texport let title;\\r\\n<\/script>\\r\\n\\r\\n<svelte:head>\\r\\n\\t<title>\uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4</title>\\r\\n</svelte:head>\\r\\n\\r\\n<div class=\\"pageerror\\">\\r\\n\\t<div class=\\"errortitle\\">\uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.</div>\\r\\n\\t<p class=\\"errormessage\\">\\r\\n\\t\\t{title}\\r\\n\\t</p>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.pageerror {\\n  text-align: center;\\n  margin: 15rem 0;\\n}\\n\\n.errortitle {\\n  font-size: 1.25rem;\\n  font-weight: bold;\\n}\\n\\n.errormessage {\\n  margin-top: 25px;\\n}</style>\\r\\n"],"names":[],"mappings":"AAyBmB,UAAU,cAAC,CAAC,AAC7B,UAAU,CAAE,MAAM,CAClB,MAAM,CAAE,KAAK,CAAC,CAAC,AACjB,CAAC,AAED,WAAW,cAAC,CAAC,AACX,SAAS,CAAE,OAAO,CAClB,WAAW,CAAE,IAAI,AACnB,CAAC,AAED,aAAa,cAAC,CAAC,AACb,UAAU,CAAE,IAAI,AAClB,CAAC"}'
};
function load$3({ error: error2, status }) {
  return {
    props: { title: `${status}: ${error2.message}` }
  };
}
const _error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  $$result.css.add(css$6);
  return `${$$result.head += `${$$result.title = `<title>\uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4</title>`, ""}`, ""}

<div class="${"pageerror svelte-asfnn1"}"><div class="${"errortitle svelte-asfnn1"}">\uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.</div>
	<p class="${"errormessage svelte-asfnn1"}">${escape(title)}</p>
</div>`;
});
var __error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _error,
  load: load$3
});
const supabase = createClient("https://pvyvzfpfyqwdbjbxegzw.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjcxNTM1NSwiZXhwIjoxOTQ4MjkxMzU1fQ.Pdb-d7UmSDY5f3a1xtTUrivmx8nEhpsfXtA-6sw470Q");
function user() {
  return supabase.auth.user();
}
async function fetchApiServer(address) {
  let r;
  await fetch(`http://localhost:4000${address}`).then((res) => res.json()).then((data) => r = data);
  return r;
}
async function profile(id) {
  return await fetchApiServer(`/account/profile?id=${id}`);
}
async function getProfile() {
  const u = user();
  return { user: u, profile: await profile(u ? u.id : null) };
}
var index_svelte_svelte_type_style_lang$2 = "";
const css$5 = {
  code: ".index.svelte-hxvu8s{padding-top:125px;width:90%;margin:0 auto}.indextitle.svelte-hxvu8s{font-size:2.75rem;width:40%;display:block;word-break:keep-all;line-height:45px}.indexhead1.svelte-hxvu8s{margin:0}.indexcontent.svelte-hxvu8s{margin-top:15px;color:var(--theme-gray);width:40%;word-break:keep-all}.indexhead.svelte-hxvu8s{display:flex}.indexstart.svelte-hxvu8s{margin-top:45px}.indexbtn.svelte-hxvu8s{border:none;cursor:pointer;background-color:var(--blue);border-radius:5px}.btnwhite.svelte-hxvu8s{font-weight:bold;color:#ffffff}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { getProfile } from '$lib/account';\\r\\n(async function () {\\r\\n    const u = await getProfile();\\r\\n})();\\r\\n<\/script>\\r\\n\\r\\n<svelte:head>\\r\\n\\t<title>\uCE5C\uAD6C\uB4E4\uACFC \uD568\uAED8 \uD589\uBCF5\uD55C \uCD94\uC5B5\uC744 \uC313\uC73C\uC138\uC694.</title>\\r\\n</svelte:head>\\r\\n\\r\\n<div class=\\"index\\">\\r\\n\\t<div class=\\"indexhead\\">\\r\\n\\t\\t<div class=\\"indexhead1\\">\\r\\n\\t\\t\\t<div class=\\"indextitle\\">\\r\\n\\t\\t\\t\\t<span class=\\"hl-b\\">\uCE5C\uAD6C\uB4E4\uACFC</span>\\r\\n\\t\\t\\t\\t\uD568\uAED8 \uD589\uBCF5\uD55C\\r\\n\\t\\t\\t\\t<span class=\\"hl-b\\">\uCD94\uC5B5\uC744</span>\\r\\n\\t\\t\\t\\t\uC313\uC73C\uC138\uC694.\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div class=\\"indexcontent\\">\\r\\n\\t\\t\\t\\t\uB300\uC0C1\uC5D0\uAC8C \uACF5\uAC1C\uC801\uC73C\uB85C \uD558\uACE0 \uC2F6\uC5C8\uB358 \uB9D0\uC744 \uAEBC\uB9AC\uB08C\uC5C6\uC774 \uD558\uC138\uC694. facebook\uC758 \uD0C0\uC784\uB77C\uC778\uACFC \uD761\uC0AC\uD569\uB2C8\uB2E4! \uB300\uC0C1\uC774 \uC775\uBA85\uC744 \uD5C8\uC6A9\uD558\uBA74\\r\\n\\t\\t\\t\\t\uB85C\uADF8\uC778 \uC5C6\uC774\uB3C4 \uB9C8\uC74C\uC744 \uC804\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n\\t<div class=\\"indexstart\\">\\r\\n\\t\\t<a href=\\"/api/dashboard\\" class=\\"no-deco\\">\\r\\n\\t\\t\\t<button class=\\"btn indexbtn\\">\\r\\n\\t\\t\\t\\t<span class=\\"btnwhite\\">\uB300\uC2DC\uBCF4\uB4DC</span>\\r\\n\\t\\t\\t</button>\\r\\n\\t\\t</a>\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.index {\\n  padding-top: 125px;\\n  width: 90%;\\n  margin: 0 auto;\\n}\\n\\n.indextitle {\\n  font-size: 2.75rem;\\n  width: 40%;\\n  display: block;\\n  word-break: keep-all;\\n  line-height: 45px;\\n}\\n\\n.indexhead1 {\\n  margin: 0;\\n}\\n\\n.indexcontent {\\n  margin-top: 15px;\\n  color: var(--theme-gray);\\n  width: 40%;\\n  word-break: keep-all;\\n}\\n\\n.indexhead {\\n  display: flex;\\n}\\n\\n.indexstart {\\n  margin-top: 45px;\\n}\\n\\n.indexbtn {\\n  border: none;\\n  cursor: pointer;\\n  background-color: var(--blue);\\n  border-radius: 5px;\\n}\\n\\n.btnwhite {\\n  font-weight: bold;\\n  color: #ffffff;\\n}</style>\\r\\n"],"names":[],"mappings":"AAkCmB,MAAM,cAAC,CAAC,AACzB,WAAW,CAAE,KAAK,CAClB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,CAAC,CAAC,IAAI,AAChB,CAAC,AAED,WAAW,cAAC,CAAC,AACX,SAAS,CAAE,OAAO,CAClB,KAAK,CAAE,GAAG,CACV,OAAO,CAAE,KAAK,CACd,UAAU,CAAE,QAAQ,CACpB,WAAW,CAAE,IAAI,AACnB,CAAC,AAED,WAAW,cAAC,CAAC,AACX,MAAM,CAAE,CAAC,AACX,CAAC,AAED,aAAa,cAAC,CAAC,AACb,UAAU,CAAE,IAAI,CAChB,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,KAAK,CAAE,GAAG,CACV,UAAU,CAAE,QAAQ,AACtB,CAAC,AAED,UAAU,cAAC,CAAC,AACV,OAAO,CAAE,IAAI,AACf,CAAC,AAED,WAAW,cAAC,CAAC,AACX,UAAU,CAAE,IAAI,AAClB,CAAC,AAED,SAAS,cAAC,CAAC,AACT,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,OAAO,CACf,gBAAgB,CAAE,IAAI,MAAM,CAAC,CAC7B,aAAa,CAAE,GAAG,AACpB,CAAC,AAED,SAAS,cAAC,CAAC,AACT,WAAW,CAAE,IAAI,CACjB,KAAK,CAAE,OAAO,AAChB,CAAC"}`
};
const Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (async function() {
    await getProfile();
  })();
  $$result.css.add(css$5);
  return `${$$result.head += `${$$result.title = `<title>\uCE5C\uAD6C\uB4E4\uACFC \uD568\uAED8 \uD589\uBCF5\uD55C \uCD94\uC5B5\uC744 \uC313\uC73C\uC138\uC694.</title>`, ""}`, ""}

<div class="${"index svelte-hxvu8s"}"><div class="${"indexhead svelte-hxvu8s"}"><div class="${"indexhead1 svelte-hxvu8s"}"><div class="${"indextitle svelte-hxvu8s"}"><span class="${"hl-b"}">\uCE5C\uAD6C\uB4E4\uACFC</span>
				\uD568\uAED8 \uD589\uBCF5\uD55C
				<span class="${"hl-b"}">\uCD94\uC5B5\uC744</span>
				\uC313\uC73C\uC138\uC694.
			</div>
			<div class="${"indexcontent svelte-hxvu8s"}">\uB300\uC0C1\uC5D0\uAC8C \uACF5\uAC1C\uC801\uC73C\uB85C \uD558\uACE0 \uC2F6\uC5C8\uB358 \uB9D0\uC744 \uAEBC\uB9AC\uB08C\uC5C6\uC774 \uD558\uC138\uC694. facebook\uC758 \uD0C0\uC784\uB77C\uC778\uACFC \uD761\uC0AC\uD569\uB2C8\uB2E4! \uB300\uC0C1\uC774 \uC775\uBA85\uC744 \uD5C8\uC6A9\uD558\uBA74
				\uB85C\uADF8\uC778 \uC5C6\uC774\uB3C4 \uB9C8\uC74C\uC744 \uC804\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.
			</div></div></div>
	<div class="${"indexstart svelte-hxvu8s"}"><a href="${"/api/dashboard"}" class="${"no-deco"}"><button class="${"btn indexbtn svelte-hxvu8s"}"><span class="${"btnwhite svelte-hxvu8s"}">\uB300\uC2DC\uBCF4\uB4DC</span></button></a></div>
</div>`;
});
var index$5 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes
});
const Setting = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  if (typeof window !== "undefined") {
    window.location.replace("/account/setting/index");
  }
  return ``;
});
var index$4 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Setting
});
var _page__svelte_svelte_type_style_lang = "";
const css$4 = {
  code: ".setting.svelte-1jlhrfd.svelte-1jlhrfd{width:90%;margin:50px auto}.setting.svelte-1jlhrfd .title.svelte-1jlhrfd{font-weight:bold;font-size:1.25rem}",
  map: '{"version":3,"file":"[page].svelte","sources":["[page].svelte"],"sourcesContent":["<script context=\\"module\\">\\r\\n\\texport async function load({ page }) {\\r\\n\\t\\treturn {\\r\\n\\t\\t\\tprops: {\\r\\n\\t\\t\\t\\tpage: page.params.page\\r\\n\\t\\t\\t}\\r\\n\\t\\t};\\r\\n\\t}\\r\\n<\/script>\\r\\n\\r\\n<script>\\r\\n\\texport let page;\\r\\n<\/script>\\r\\n\\r\\n<div class=\\"setting\\">\\r\\n\\t<div class=\\"title\\">Account Setting</div>\\r\\n\\t{page}\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.setting {\\n  width: 90%;\\n  margin: 50px auto;\\n}\\n.setting .title {\\n  font-weight: bold;\\n  font-size: 1.25rem;\\n}</style>\\r\\n"],"names":[],"mappings":"AAmBmB,QAAQ,8BAAC,CAAC,AAC3B,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,IAAI,CAAC,IAAI,AACnB,CAAC,AACD,uBAAQ,CAAC,MAAM,eAAC,CAAC,AACf,WAAW,CAAE,IAAI,CACjB,SAAS,CAAE,OAAO,AACpB,CAAC"}'
};
async function load$2({ page }) {
  return { props: { page: page.params.page } };
}
const U5Bpageu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { page } = $$props;
  if ($$props.page === void 0 && $$bindings.page && page !== void 0)
    $$bindings.page(page);
  $$result.css.add(css$4);
  return `<div class="${"setting svelte-1jlhrfd"}"><div class="${"title svelte-1jlhrfd"}">Account Setting</div>
	${escape(page)}
</div>`;
});
var _page_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": U5Bpageu5D,
  load: load$2
});
async function signout$1() {
  return await supabase.auth.signOut();
}
const Signout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  signout$1();
  return `${$$result.head += `${$$result.title = `<title>Signout - Platform</title>`, ""}`, ""}
Signout`;
});
var signout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Signout
});
var signin_svelte_svelte_type_style_lang = "";
const css$3 = {
  code: ".logincard.svelte-1p34tyi.svelte-1p34tyi{width:400px;height:600px;background-color:#ffffff;border:var(--theme-nav-color) solid 2px;border-radius:5px;margin:0 auto;justify-content:center;color:#000000}.logincardcontent.svelte-1p34tyi.svelte-1p34tyi{padding:15px 20px}.logincardcontent.svelte-1p34tyi .welcomecontent.svelte-1p34tyi{margin-top:50px;font-size:1.75rem;text-align:center}.logincardcontent.svelte-1p34tyi .content.svelte-1p34tyi{margin-top:10px;color:#696969;font-size:0.85rem;text-align:center}.logincardcontent.svelte-1p34tyi .form.svelte-1p34tyi{margin:45px auto;width:90%}.logincardcontent.svelte-1p34tyi .form input.svelte-1p34tyi{margin-top:15px;font-size:13px;width:100%;height:38px;border-radius:7px;padding:0px 15px;outline:none;border:1.5px solid var(--theme-nav-color);transition:all ease 0.2s 0s}.logincardcontent.svelte-1p34tyi .form input.svelte-1p34tyi:focus{border:1.5px solid var(--blue);outline:none;transition:all ease 0.2s 0s}.logincardcontent.svelte-1p34tyi .confirm.svelte-1p34tyi{padding-top:15px;margin:0 auto;width:90%}.logincardcontent.svelte-1p34tyi .confirm .error.svelte-1p34tyi{font-size:13px;color:#ff8c8c;visibility:hidden}.logincardcontent.svelte-1p34tyi .confirm .indexbtn.svelte-1p34tyi{margin-top:5px;border:none;cursor:pointer;width:100%;background-color:var(--blue);border-radius:5px}.logincardcontent.svelte-1p34tyi .confirm .btnwhite.svelte-1p34tyi{font-weight:bold;color:#ffffff}",
  map: `{"version":3,"file":"signin.svelte","sources":["signin.svelte"],"sourcesContent":["<script lang=\\"ts\\">import signin from '$lib/account/signin';\\r\\nlet email = '';\\r\\nlet password = '';\\r\\nasync function login() {\\r\\n    if (await (await signin(email, password)).error) {\\r\\n        document.getElementById('loginerror').style.visibility = 'visible';\\r\\n    }\\r\\n    else {\\r\\n        window.location.href = '/';\\r\\n    }\\r\\n}\\r\\n<\/script>\\r\\n\\r\\n<svelte:head>\\r\\n\\t<title>Signin - Platform</title>\\r\\n</svelte:head>\\r\\n\\r\\n<div class=\\"logincard\\">\\r\\n\\t<div class=\\"logincardcontent\\">\\r\\n\\t\\t<div class=\\"welcomecontent\\">\uD658\uC601\uD569\uB2C8\uB2E4</div>\\r\\n\\t\\t<div class=\\"content\\">\\r\\n\\t\\t\\t\uCE5C\uAD6C\uB4E4\uACFC \uCD94\uC5B5\uC744 \uB9CC\uB4E4\uAE30 \uC804, \uBA3C\uC800 \uB85C\uADF8\uC778\uC744 \uC9C4\uD589\uD574\uC8FC\uC138\uC694.\\r\\n\\t\\t\\t<div class=\\"signup\\">\uACC4\uC815\uC774 \uC5C6\uC73C\uC2E0\uAC00\uC694? <a href=\\"/account/signup\\">\uACC4\uC815 \uB9CC\uB4E4\uAE30</a></div>\\r\\n\\t\\t</div>\\r\\n\\t\\t<div class=\\"form\\">\\r\\n\\t\\t\\t<input bind:value={email} type=\\"text\\" placeholder=\\"email *\\" />\\r\\n\\t\\t\\t<input bind:value={password} type=\\"password\\" placeholder=\\"password *\\" />\\r\\n\\t\\t</div>\\r\\n\\t\\t<div class=\\"confirm\\">\\r\\n\\t\\t\\t<div class=\\"error\\" id=\\"loginerror\\">\uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uD2C0\uB9BD\uB2C8\uB2E4.</div>\\r\\n\\t\\t\\t<button class=\\"btn indexbtn\\" on:click={login}>\\r\\n\\t\\t\\t\\t<span class=\\"btnwhite\\">\uB85C\uADF8\uC778</span>\\r\\n\\t\\t\\t</button>\\r\\n\\t\\t</div>\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.logincard {\\n  width: 400px;\\n  height: 600px;\\n  background-color: #ffffff;\\n  border: var(--theme-nav-color) solid 2px;\\n  border-radius: 5px;\\n  margin: 0 auto;\\n  justify-content: center;\\n  color: #000000;\\n}\\n\\n.logincardcontent {\\n  padding: 15px 20px;\\n}\\n.logincardcontent .welcomecontent {\\n  margin-top: 50px;\\n  font-size: 1.75rem;\\n  text-align: center;\\n}\\n.logincardcontent .content {\\n  margin-top: 10px;\\n  color: #696969;\\n  font-size: 0.85rem;\\n  text-align: center;\\n}\\n.logincardcontent .form {\\n  margin: 45px auto;\\n  width: 90%;\\n}\\n.logincardcontent .form input {\\n  margin-top: 15px;\\n  font-size: 13px;\\n  width: 100%;\\n  height: 38px;\\n  border-radius: 7px;\\n  padding: 0px 15px;\\n  outline: none;\\n  border: 1.5px solid var(--theme-nav-color);\\n  transition: all ease 0.2s 0s;\\n}\\n.logincardcontent .form input:focus {\\n  border: 1.5px solid var(--blue);\\n  outline: none;\\n  transition: all ease 0.2s 0s;\\n}\\n.logincardcontent .confirm {\\n  padding-top: 15px;\\n  margin: 0 auto;\\n  width: 90%;\\n}\\n.logincardcontent .confirm .error {\\n  font-size: 13px;\\n  color: #ff8c8c;\\n  visibility: hidden;\\n}\\n.logincardcontent .confirm .indexbtn {\\n  margin-top: 5px;\\n  border: none;\\n  cursor: pointer;\\n  width: 100%;\\n  background-color: var(--blue);\\n  border-radius: 5px;\\n}\\n.logincardcontent .confirm .btnwhite {\\n  font-weight: bold;\\n  color: #ffffff;\\n}</style>\\r\\n"],"names":[],"mappings":"AAqCmB,UAAU,8BAAC,CAAC,AAC7B,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,KAAK,CACb,gBAAgB,CAAE,OAAO,CACzB,MAAM,CAAE,IAAI,iBAAiB,CAAC,CAAC,KAAK,CAAC,GAAG,CACxC,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,eAAe,CAAE,MAAM,CACvB,KAAK,CAAE,OAAO,AAChB,CAAC,AAED,iBAAiB,8BAAC,CAAC,AACjB,OAAO,CAAE,IAAI,CAAC,IAAI,AACpB,CAAC,AACD,gCAAiB,CAAC,eAAe,eAAC,CAAC,AACjC,UAAU,CAAE,IAAI,CAChB,SAAS,CAAE,OAAO,CAClB,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,gCAAiB,CAAC,QAAQ,eAAC,CAAC,AAC1B,UAAU,CAAE,IAAI,CAChB,KAAK,CAAE,OAAO,CACd,SAAS,CAAE,OAAO,CAClB,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,gCAAiB,CAAC,KAAK,eAAC,CAAC,AACvB,MAAM,CAAE,IAAI,CAAC,IAAI,CACjB,KAAK,CAAE,GAAG,AACZ,CAAC,AACD,gCAAiB,CAAC,KAAK,CAAC,KAAK,eAAC,CAAC,AAC7B,UAAU,CAAE,IAAI,CAChB,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,GAAG,CAAC,IAAI,CACjB,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,KAAK,CAAC,KAAK,CAAC,IAAI,iBAAiB,CAAC,CAC1C,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CAAC,EAAE,AAC9B,CAAC,AACD,gCAAiB,CAAC,KAAK,CAAC,oBAAK,MAAM,AAAC,CAAC,AACnC,MAAM,CAAE,KAAK,CAAC,KAAK,CAAC,IAAI,MAAM,CAAC,CAC/B,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CAAC,EAAE,AAC9B,CAAC,AACD,gCAAiB,CAAC,QAAQ,eAAC,CAAC,AAC1B,WAAW,CAAE,IAAI,CACjB,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,KAAK,CAAE,GAAG,AACZ,CAAC,AACD,gCAAiB,CAAC,QAAQ,CAAC,MAAM,eAAC,CAAC,AACjC,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,OAAO,CACd,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,gCAAiB,CAAC,QAAQ,CAAC,SAAS,eAAC,CAAC,AACpC,UAAU,CAAE,GAAG,CACf,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,OAAO,CACf,KAAK,CAAE,IAAI,CACX,gBAAgB,CAAE,IAAI,MAAM,CAAC,CAC7B,aAAa,CAAE,GAAG,AACpB,CAAC,AACD,gCAAiB,CAAC,QAAQ,CAAC,SAAS,eAAC,CAAC,AACpC,WAAW,CAAE,IAAI,CACjB,KAAK,CAAE,OAAO,AAChB,CAAC"}`
};
const Signin = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let email = "";
  let password = "";
  $$result.css.add(css$3);
  return `${$$result.head += `${$$result.title = `<title>Signin - Platform</title>`, ""}`, ""}

<div class="${"logincard svelte-1p34tyi"}"><div class="${"logincardcontent svelte-1p34tyi"}"><div class="${"welcomecontent svelte-1p34tyi"}">\uD658\uC601\uD569\uB2C8\uB2E4</div>
		<div class="${"content svelte-1p34tyi"}">\uCE5C\uAD6C\uB4E4\uACFC \uCD94\uC5B5\uC744 \uB9CC\uB4E4\uAE30 \uC804, \uBA3C\uC800 \uB85C\uADF8\uC778\uC744 \uC9C4\uD589\uD574\uC8FC\uC138\uC694.
			<div class="${"signup"}">\uACC4\uC815\uC774 \uC5C6\uC73C\uC2E0\uAC00\uC694? <a href="${"/account/signup"}">\uACC4\uC815 \uB9CC\uB4E4\uAE30</a></div></div>
		<div class="${"form svelte-1p34tyi"}"><input type="${"text"}" placeholder="${"email *"}" class="${"svelte-1p34tyi"}"${add_attribute("value", email, 0)}>
			<input type="${"password"}" placeholder="${"password *"}" class="${"svelte-1p34tyi"}"${add_attribute("value", password, 0)}></div>
		<div class="${"confirm svelte-1p34tyi"}"><div class="${"error svelte-1p34tyi"}" id="${"loginerror"}">\uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uD2C0\uB9BD\uB2C8\uB2E4.</div>
			<button class="${"btn indexbtn svelte-1p34tyi"}"><span class="${"btnwhite svelte-1p34tyi"}">\uB85C\uADF8\uC778</span></button></div></div>
</div>`;
});
var signin = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Signin
});
var index_svelte_svelte_type_style_lang$1 = "";
const css$2 = {
  code: ".logincard.svelte-1cgj9rk.svelte-1cgj9rk{width:400px;height:600px;background-color:#ffffff;border:var(--theme-nav-color) solid 2px;border-radius:7px;margin:0 auto;justify-content:center;color:#000000}.logincardcontent.svelte-1cgj9rk.svelte-1cgj9rk{padding:15px 20px}.logincardcontent.svelte-1cgj9rk .welcomecontent.svelte-1cgj9rk{margin-top:50px;font-size:1.75rem;text-align:center}.logincardcontent.svelte-1cgj9rk .content.svelte-1cgj9rk{margin-top:10px;color:#696969;font-size:0.85rem;text-align:center}.logincardcontent.svelte-1cgj9rk .form.svelte-1cgj9rk{margin:45px auto;width:90%}.logincardcontent.svelte-1cgj9rk .form input.svelte-1cgj9rk{margin-top:15px;font-size:13px;width:100%;height:38px;border-radius:7px;padding:0px 15px;outline:none;border:1.5px solid var(--theme-nav-color);transition:all ease 0.2s 0s}.logincardcontent.svelte-1cgj9rk .form input.svelte-1cgj9rk:focus{border:1.5px solid var(--blue);outline:none;transition:all ease 0.2s 0s}.logincardcontent.svelte-1cgj9rk .confirm.svelte-1cgj9rk{padding-top:15px;margin:0 auto;width:90%}.logincardcontent.svelte-1cgj9rk .confirm .error.svelte-1cgj9rk{font-size:13px;color:#ff8c8c;visibility:hidden}.logincardcontent.svelte-1cgj9rk .confirm .indexbtn.svelte-1cgj9rk{margin-top:5px;border:none;cursor:pointer;width:100%;background-color:var(--blue);border-radius:5px}.logincardcontent.svelte-1cgj9rk .confirm .btnwhite.svelte-1cgj9rk{font-weight:bold;color:#ffffff}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script lang=\\"ts\\">import signup from '$lib/account/signup';\\r\\nimport '$lib/account/user';\\r\\nimport fetchApiServer from '$lib/backend/fetch';\\r\\nlet email = '';\\r\\nlet password = '';\\r\\nlet retypepassword = '';\\r\\nlet nickname = '';\\r\\nlet about = '';\\r\\nlet level = 1;\\r\\nlet message = '\uC774\uBBF8 \uC874\uC7AC\uD558\uB294 \uACC4\uC815\uC785\uB2C8\uB2E4.';\\r\\nconst show = () => {\\r\\n    document.getElementById('loginerror').style.visibility = 'visible';\\r\\n};\\r\\nconst hide = () => {\\r\\n    document.getElementById('loginerror').style.visibility = 'hidden';\\r\\n};\\r\\nasync function login() {\\r\\n    hide();\\r\\n    const d = await await await signup(email, password);\\r\\n    const exists = await fetchApiServer(\`/account/profilebynick?nickname=\${nickname.trim()}\`);\\r\\n    if (nickname === '') {\\r\\n        message = '\uB2C9\uB124\uC784\uC744 \uC124\uC815\uD574\uC8FC\uC138\uC694.';\\r\\n        show();\\r\\n    }\\r\\n    else if (exists.id !== null) {\\r\\n        message = '\uC774\uBBF8 \uC874\uC7AC\uD558\uB294 \uB2C9\uB124\uC784\uC785\uB2C8\uB2E4. \uB2E4\uB978 \uB2C9\uB124\uC784\uC744 \uC120\uD0DD\uD574\uC8FC\uC138\uC694.';\\r\\n        show();\\r\\n    }\\r\\n    else if (d.error) {\\r\\n        message = '\uC774\uBBF8 \uC874\uC7AC\uD558\uB294 \uACC4\uC815\uC785\uB2C8\uB2E4.';\\r\\n        show();\\r\\n    }\\r\\n    else {\\r\\n        await fetchApiServer(\`/account/create?id=\${d.user.id}&nickname=\${nickname}&about=\${about}\`);\\r\\n        level = 3;\\r\\n    }\\r\\n}\\r\\nfunction next() {\\r\\n    if (email === '' || password === '' || retypepassword === '') {\\r\\n        message = '\uD544\uC218 \uC785\uB825\uB780\uC744 \uCC44\uC6CC\uC8FC\uC138\uC694.';\\r\\n        show();\\r\\n    }\\r\\n    else if (password.trim() !== retypepassword.trim()) {\\r\\n        message = '\uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.';\\r\\n        show();\\r\\n    }\\r\\n    else {\\r\\n        level = 2;\\r\\n    }\\r\\n}\\r\\n<\/script>\\r\\n\\r\\n<svelte:head>\\r\\n\\t<title>Signup - Platform</title>\\r\\n</svelte:head>\\r\\n\\r\\n<div class=\\"logincard\\">\\r\\n\\t<div class=\\"logincardcontent\\">\\r\\n\\t\\t{#if level === 1}\\r\\n\\t\\t\\t<div class=\\"welcomecontent\\">\uD658\uC601\uD569\uB2C8\uB2E4</div>\\r\\n\\t\\t\\t<div class=\\"content\\">\\r\\n\\t\\t\\t\\t\uCE5C\uAD6C\uB4E4\uC758 \uB9C8\uC74C\uC744 \uBCF4\uAE30 \uC704\uD574\uC11C\uB294 \uACC4\uC815\uC774 \uD544\uC694\uD574\uC694!\\r\\n\\t\\t\\t\\t<div class=\\"signup\\">\\r\\n\\t\\t\\t\\t\\t\uACC4\uC815\uC774 \uC774\uBBF8 \uC788\uC73C\uC2E0\uAC00\uC694? <a href=\\"/account/signin\\">\uB85C\uADF8\uC778</a>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div class=\\"form\\">\\r\\n\\t\\t\\t\\t<input bind:value={email} type=\\"text\\" placeholder=\\"email *\\" />\\r\\n\\t\\t\\t\\t<input bind:value={password} type=\\"password\\" placeholder=\\"password *\\" />\\r\\n\\t\\t\\t\\t<input bind:value={retypepassword} type=\\"password\\" placeholder=\\"retype password *\\" />\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div class=\\"confirm\\">\\r\\n\\t\\t\\t\\t<div class=\\"error\\" id=\\"loginerror\\">{message}</div>\\r\\n\\t\\t\\t\\t<button class=\\"btn indexbtn\\" on:click={next}>\\r\\n\\t\\t\\t\\t\\t<span class=\\"btnwhite\\">\uB2E4\uC74C \uB2E8\uACC4</span>\\r\\n\\t\\t\\t\\t</button>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t{:else if level === 2}\\r\\n\\t\\t\\t<div class=\\"welcomecontent\\">\uD504\uB85C\uD544 \uC124\uC815</div>\\r\\n\\t\\t\\t<div class=\\"content\\">\\r\\n\\t\\t\\t\\t\uAC70\uC758 \uB05D\uB0AC\uC2B5\uB2C8\uB2E4!\\r\\n\\t\\t\\t\\t<div class=\\"signup\\">\\r\\n\\t\\t\\t\\t\\t\uC774\uC6A9\uC57D\uAD00\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694. <a href=\\"/policy\\">\uC774\uC6A9\uC57D\uAD00</a>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div class=\\"form\\">\\r\\n\\t\\t\\t\\t<input bind:value={nickname} type=\\"text\\" placeholder=\\"nickname *\\" />\\r\\n\\t\\t\\t\\t<input bind:value={about} type=\\"text\\" placeholder=\\"about me\\" />\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div class=\\"confirm\\">\\r\\n\\t\\t\\t\\t<div class=\\"error\\" id=\\"loginerror\\">{message}</div>\\r\\n\\t\\t\\t\\t<button class=\\"btn indexbtn\\" on:click={login}>\\r\\n\\t\\t\\t\\t\\t<span class=\\"btnwhite\\">\uD68C\uC6D0\uAC00\uC785</span>\\r\\n\\t\\t\\t\\t</button>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t{:else}\\r\\n\\t\\t\\t<div class=\\"welcomecontent\\">\uB05D\uB0AC\uC2B5\uB2C8\uB2E4</div>\\r\\n\\t\\t\\t<div class=\\"content\\">\uC774\uBA54\uC77C\uC744 \uD655\uC778\uD574\uC8FC\uC138\uC694!</div>\\r\\n\\t\\t{/if}\\r\\n\\t</div>\\r\\n</div>\\r\\n\\r\\n<style lang=\\"scss\\">.logincard {\\n  width: 400px;\\n  height: 600px;\\n  background-color: #ffffff;\\n  border: var(--theme-nav-color) solid 2px;\\n  border-radius: 7px;\\n  margin: 0 auto;\\n  justify-content: center;\\n  color: #000000;\\n}\\n\\n.logincardcontent {\\n  padding: 15px 20px;\\n}\\n.logincardcontent .welcomecontent {\\n  margin-top: 50px;\\n  font-size: 1.75rem;\\n  text-align: center;\\n}\\n.logincardcontent .content {\\n  margin-top: 10px;\\n  color: #696969;\\n  font-size: 0.85rem;\\n  text-align: center;\\n}\\n.logincardcontent .form {\\n  margin: 45px auto;\\n  width: 90%;\\n}\\n.logincardcontent .form input {\\n  margin-top: 15px;\\n  font-size: 13px;\\n  width: 100%;\\n  height: 38px;\\n  border-radius: 7px;\\n  padding: 0px 15px;\\n  outline: none;\\n  border: 1.5px solid var(--theme-nav-color);\\n  transition: all ease 0.2s 0s;\\n}\\n.logincardcontent .form input:focus {\\n  border: 1.5px solid var(--blue);\\n  outline: none;\\n  transition: all ease 0.2s 0s;\\n}\\n.logincardcontent .confirm {\\n  padding-top: 15px;\\n  margin: 0 auto;\\n  width: 90%;\\n}\\n.logincardcontent .confirm .error {\\n  font-size: 13px;\\n  color: #ff8c8c;\\n  visibility: hidden;\\n}\\n.logincardcontent .confirm .indexbtn {\\n  margin-top: 5px;\\n  border: none;\\n  cursor: pointer;\\n  width: 100%;\\n  background-color: var(--blue);\\n  border-radius: 5px;\\n}\\n.logincardcontent .confirm .btnwhite {\\n  font-weight: bold;\\n  color: #ffffff;\\n}</style>\\r\\n"],"names":[],"mappings":"AAsGmB,UAAU,8BAAC,CAAC,AAC7B,KAAK,CAAE,KAAK,CACZ,MAAM,CAAE,KAAK,CACb,gBAAgB,CAAE,OAAO,CACzB,MAAM,CAAE,IAAI,iBAAiB,CAAC,CAAC,KAAK,CAAC,GAAG,CACxC,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,eAAe,CAAE,MAAM,CACvB,KAAK,CAAE,OAAO,AAChB,CAAC,AAED,iBAAiB,8BAAC,CAAC,AACjB,OAAO,CAAE,IAAI,CAAC,IAAI,AACpB,CAAC,AACD,gCAAiB,CAAC,eAAe,eAAC,CAAC,AACjC,UAAU,CAAE,IAAI,CAChB,SAAS,CAAE,OAAO,CAClB,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,gCAAiB,CAAC,QAAQ,eAAC,CAAC,AAC1B,UAAU,CAAE,IAAI,CAChB,KAAK,CAAE,OAAO,CACd,SAAS,CAAE,OAAO,CAClB,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,gCAAiB,CAAC,KAAK,eAAC,CAAC,AACvB,MAAM,CAAE,IAAI,CAAC,IAAI,CACjB,KAAK,CAAE,GAAG,AACZ,CAAC,AACD,gCAAiB,CAAC,KAAK,CAAC,KAAK,eAAC,CAAC,AAC7B,UAAU,CAAE,IAAI,CAChB,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,GAAG,CAAC,IAAI,CACjB,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,KAAK,CAAC,KAAK,CAAC,IAAI,iBAAiB,CAAC,CAC1C,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CAAC,EAAE,AAC9B,CAAC,AACD,gCAAiB,CAAC,KAAK,CAAC,oBAAK,MAAM,AAAC,CAAC,AACnC,MAAM,CAAE,KAAK,CAAC,KAAK,CAAC,IAAI,MAAM,CAAC,CAC/B,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CAAC,EAAE,AAC9B,CAAC,AACD,gCAAiB,CAAC,QAAQ,eAAC,CAAC,AAC1B,WAAW,CAAE,IAAI,CACjB,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,KAAK,CAAE,GAAG,AACZ,CAAC,AACD,gCAAiB,CAAC,QAAQ,CAAC,MAAM,eAAC,CAAC,AACjC,SAAS,CAAE,IAAI,CACf,KAAK,CAAE,OAAO,CACd,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,gCAAiB,CAAC,QAAQ,CAAC,SAAS,eAAC,CAAC,AACpC,UAAU,CAAE,GAAG,CACf,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,OAAO,CACf,KAAK,CAAE,IAAI,CACX,gBAAgB,CAAE,IAAI,MAAM,CAAC,CAC7B,aAAa,CAAE,GAAG,AACpB,CAAC,AACD,gCAAiB,CAAC,QAAQ,CAAC,SAAS,eAAC,CAAC,AACpC,WAAW,CAAE,IAAI,CACjB,KAAK,CAAE,OAAO,AAChB,CAAC"}`
};
const Signup = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let email = "";
  let password = "";
  let retypepassword = "";
  let message = "\uC774\uBBF8 \uC874\uC7AC\uD558\uB294 \uACC4\uC815\uC785\uB2C8\uB2E4.";
  $$result.css.add(css$2);
  return `${$$result.head += `${$$result.title = `<title>Signup - Platform</title>`, ""}`, ""}

<div class="${"logincard svelte-1cgj9rk"}"><div class="${"logincardcontent svelte-1cgj9rk"}">${`<div class="${"welcomecontent svelte-1cgj9rk"}">\uD658\uC601\uD569\uB2C8\uB2E4</div>
			<div class="${"content svelte-1cgj9rk"}">\uCE5C\uAD6C\uB4E4\uC758 \uB9C8\uC74C\uC744 \uBCF4\uAE30 \uC704\uD574\uC11C\uB294 \uACC4\uC815\uC774 \uD544\uC694\uD574\uC694!
				<div class="${"signup"}">\uACC4\uC815\uC774 \uC774\uBBF8 \uC788\uC73C\uC2E0\uAC00\uC694? <a href="${"/account/signin"}">\uB85C\uADF8\uC778</a></div></div>
			<div class="${"form svelte-1cgj9rk"}"><input type="${"text"}" placeholder="${"email *"}" class="${"svelte-1cgj9rk"}"${add_attribute("value", email, 0)}>
				<input type="${"password"}" placeholder="${"password *"}" class="${"svelte-1cgj9rk"}"${add_attribute("value", password, 0)}>
				<input type="${"password"}" placeholder="${"retype password *"}" class="${"svelte-1cgj9rk"}"${add_attribute("value", retypepassword, 0)}></div>
			<div class="${"confirm svelte-1cgj9rk"}"><div class="${"error svelte-1cgj9rk"}" id="${"loginerror"}">${escape(message)}</div>
				<button class="${"btn indexbtn svelte-1cgj9rk"}"><span class="${"btnwhite svelte-1cgj9rk"}">\uB2E4\uC74C \uB2E8\uACC4</span></button></div>`}</div>
</div>`;
});
var index$3 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Signup
});
const Explore = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${$$result.head += `${$$result.title = `<title>explore - platform</title>`, ""}`, ""}`;
});
var index$2 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Explore
});
const Policy = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `policy`;
});
var index$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Policy
});
const Dashboard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  (async function() {
    const u = await getProfile();
    if (u.user) {
      window.location.replace(`/@${u.profile.nickname}`);
    } else {
      window.location.replace(`/account/signin`);
    }
  })();
  return `${$$result.head += `${$$result.title = `<title>Connecting..</title>`, ""}`, ""}`;
});
var dashboard = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Dashboard
});
const ADMIN = ["0bd0b4cd-e571-4a96-9b7a-8adcdf7f0200", "e2b5c7e3-be95-4f61-a9ec-f296cfa314b7"];
var badge_svelte_svelte_type_style_lang = "";
const css$1 = {
  code: ".badge.svelte-3t1mvb{width:auto;height:16px;border-radius:9999px;background-color:#57bbe246;color:var(--blue);display:inline-flex;align-items:center;font-size:0.75rem;line-height:1rem;padding:10px 11px;margin-left:1px}",
  map: '{"version":3,"file":"badge.svelte","sources":["badge.svelte"],"sourcesContent":["<span class=\\"badge\\">\\r\\n\\t<slot />\\r\\n</span>\\r\\n\\r\\n<style lang=\\"scss\\">.badge {\\n  width: auto;\\n  height: 16px;\\n  border-radius: 9999px;\\n  background-color: #57bbe246;\\n  color: var(--blue);\\n  display: inline-flex;\\n  align-items: center;\\n  font-size: 0.75rem;\\n  line-height: 1rem;\\n  padding: 10px 11px;\\n  margin-left: 1px;\\n}</style>\\r\\n"],"names":[],"mappings":"AAImB,MAAM,cAAC,CAAC,AACzB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,MAAM,CACrB,gBAAgB,CAAE,SAAS,CAC3B,KAAK,CAAE,IAAI,MAAM,CAAC,CAClB,OAAO,CAAE,WAAW,CACpB,WAAW,CAAE,MAAM,CACnB,SAAS,CAAE,OAAO,CAClB,WAAW,CAAE,IAAI,CACjB,OAAO,CAAE,IAAI,CAAC,IAAI,CAClB,WAAW,CAAE,GAAG,AAClB,CAAC"}'
};
const Badge = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$1);
  return `<span class="${"badge svelte-3t1mvb"}">${slots.default ? slots.default({}) : ``}
</span>`;
});
function getTime() {
  const date = new Date();
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
}
function getAgo(t) {
  console.log(t);
  return TimeCounting(t, { objectTime: getTime(), lang: "ko" });
}
function linkParser(str) {
  const matches = str.match(/\bhttps?:\/\/\S+/gi) || [];
  matches.forEach((e) => {
    str = str.replace(e, `<a href="${e}">${e}</a>`);
  });
  return str;
}
function userParser(str) {
  const matches = str.match(/[@]\S+/gi) || [];
  matches.forEach((e) => {
    str = str.replace(e, `<a href="/${e}/gg">${e}</a>`);
  });
  return str;
}
var index_svelte_svelte_type_style_lang = "";
const css = {
  code: ".user-container.svelte-1kz8au2.svelte-1kz8au2{width:100%;margin:0 auto}.user-container.svelte-1kz8au2 .user.svelte-1kz8au2{width:100%;height:120px;border-bottom:var(--theme-nav-color) solid 1.2px;padding:15px 30px;text-align:center}.user-container.svelte-1kz8au2 .user .name.svelte-1kz8au2{font-size:1.75rem;font-weight:light}.user-container.svelte-1kz8au2 .user .about.svelte-1kz8au2{font-size:0.95rem;color:var(--theme-gray)}.user-container.svelte-1kz8au2 .main-content.svelte-1kz8au2{display:flex;margin-top:25px;width:75%;margin:35px auto;word-break:break-all}.user-container.svelte-1kz8au2 .main-content .show.svelte-1kz8au2{margin-top:60px;margin-right:5%;width:30%;height:220px;border-radius:15px;border:0.1px solid var(--theme-nav-color);box-shadow:0 0 1px var(--theme-nav-color);padding:15px 22.5px}.user-container.svelte-1kz8au2 .main-content .show .show-title.svelte-1kz8au2{font-weight:bold;font-size:1.225rem}.user-container.svelte-1kz8au2 .main-content .show .show-content.svelte-1kz8au2{margin-top:15px}.user-container.svelte-1kz8au2 .main-content .show .show-follow.svelte-1kz8au2{margin-bottom:5px}.user-container.svelte-1kz8au2 .main-content .show .show-bold.svelte-1kz8au2{font-weight:bold}.user-container.svelte-1kz8au2 .main-content .show .show-button.svelte-1kz8au2{margin-top:18px;width:100%;height:35px;border-radius:7px;outline:none;border:none;background-color:var(--theme-nav-color);transition:all ease 0.2s 0s}.user-container.svelte-1kz8au2 .main-content .show .show-button.svelte-1kz8au2:hover{border:none;background-color:var(--theme-nav-color-hover);transition:all ease 0.2s 0s}.user-container.svelte-1kz8au2 .main-content .post.svelte-1kz8au2{width:70%}.user-container.svelte-1kz8au2 .main-content .post .card.svelte-1kz8au2{box-shadow:0 0 2.2px var(--theme-nav-color);width:100%;height:auto;padding:17px 17px;border:var(--theme-nav-color) solid 1.5px;border-radius:7.5px;margin:35px 0}.user-container.svelte-1kz8au2 .main-content .post .card .title.svelte-1kz8au2{font-size:1rem;font-weight:bold}.user-container.svelte-1kz8au2 .main-content .post .card .title .time.svelte-1kz8au2{font-weight:lighter;font-size:0.75rem;color:var(--theme-gray);padding-left:2px}.user-container.svelte-1kz8au2 .main-content .post .card .content.svelte-1kz8au2{margin-top:7px}.user-container.svelte-1kz8au2 .form.svelte-1kz8au2{margin:45px auto;width:100%;display:flex}.user-container.svelte-1kz8au2 .form input.svelte-1kz8au2{margin-top:15px;font-size:13px;min-width:90%;height:38px;border-radius:7px;padding:0px 15px;outline:none;border:1.5px solid var(--theme-nav-color);transition:all ease 0.2s 0s;color:var(--theme-color);background-color:var(--theme-background)}.user-container.svelte-1kz8au2 .form input.svelte-1kz8au2:focus{border:1.5px solid var(--blue);outline:none;transition:all ease 0.2s 0s}.user-container.svelte-1kz8au2 .form button.svelte-1kz8au2{margin-top:15px;margin-left:5px;width:100%;border-radius:5px;outline:none;border:none;height:38px;background-color:var(--blue);color:#ffffff;font-weight:bold}",
  map: `{"version":3,"file":"index.svelte","sources":["index.svelte"],"sourcesContent":["<script context=\\"module\\">\\r\\n\\texport async function load({ page }) {\\r\\n\\t\\treturn {\\r\\n\\t\\t\\tprops: {\\r\\n\\t\\t\\t\\tuser: page.params.user\\r\\n\\t\\t\\t}\\r\\n\\t\\t};\\r\\n\\t}\\r\\n<\/script>\\r\\n\\r\\n<script>\\r\\n\\timport { getProfile } from '$lib/account';\\r\\n\\r\\n\\timport fetchApiServer from '$lib/backend/fetch';\\r\\n\\timport { ADMIN } from '../../constants/admin';\\r\\n\\timport Badge from '../../components/badge.svelte';\\r\\n\\timport getAgo from '$lib/time/ago';\\r\\n\\timport linkParser from '$lib/parser/link';\\r\\n\\timport userParser from '$lib/parser/user';\\r\\n\\r\\n\\texport let user;\\r\\n\\r\\n\\tlet uploading = false;\\r\\n\\r\\n\\tasync function loadUser() {\\r\\n\\t\\tconst res = await fetchApiServer(\`/account/profilebynick?nickname=\${user}\`);\\r\\n\\r\\n\\t\\treturn res;\\r\\n\\t}\\r\\n\\tasync function upload() {\\r\\n\\t\\tif (inputtext && !uploading) {\\r\\n\\t\\t\\tconst u = await getProfile();\\r\\n\\t\\t\\tif (u.profile.id === null) {\\r\\n\\t\\t\\t\\twindow.location.href = '/account/signin';\\r\\n\\t\\t\\t}\\r\\n\\t\\t\\tuploading = true;\\r\\n\\t\\t\\tawait fetchApiServer(\`/upload/\${user}?by=\${await u.user.id}&nickname=\${u.profile.nickname}&content=\${inputtext}\`);\\r\\n\\r\\n\\t\\t\\tif (typeof window !== 'undefined') {\\r\\n\\t\\t\\t\\twindow.location.reload();\\r\\n\\t\\t\\t}\\r\\n\\t\\t}\\r\\n\\t}\\r\\n\\tasync function follow() {\\r\\n\\t\\tconst u = await getProfile();\\r\\n\\t\\tif (u.profile.id === null) {\\r\\n\\t\\t\\twindow.location.href = '/account/signin';\\r\\n\\t\\t}\\r\\n\\t\\tconst res = await fetchApiServer(\`/follow/\${user}?by=\${await u.user.id}\`);\\r\\n\\t\\tif (typeof window !== 'undefined') {\\r\\n\\t\\t\\twindow.location.reload();\\r\\n\\t\\t}\\r\\n\\r\\n\\t\\treturn res;\\r\\n\\t}\\r\\n\\tlet promise = loadUser();\\r\\n\\tlet inputtext = '';\\r\\n<\/script>\\r\\n\\r\\n<svelte:head>\\r\\n\\t<title>{user} - platform</title>\\r\\n</svelte:head>\\r\\n\\r\\n{#await promise then res}\\r\\n\\t{#if res.id === null}\\r\\n\\t\\tUser Not Found\\r\\n\\t{:else}\\r\\n\\t\\t<div class=\\"user-container\\">\\r\\n\\t\\t\\t<div class=\\"user\\">\\r\\n\\t\\t\\t\\t<div class=\\"name\\">\\r\\n\\t\\t\\t\\t\\t<a href=\\"/@{res.nickname}\\" class=\\"no-deco\\"> {res.nickname}</a>\\r\\n\\t\\t\\t\\t\\t{#if ADMIN.includes(res.id)}\\r\\n\\t\\t\\t\\t\\t\\t<Badge>\uC778\uC99D\uB428</Badge>\\r\\n\\t\\t\\t\\t\\t{/if}\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t<div class=\\"about\\">\\r\\n\\t\\t\\t\\t\\t{res.about}\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t\\t<div class=\\"main-content\\">\\r\\n\\t\\t\\t\\t<div class=\\"show\\">\\r\\n\\t\\t\\t\\t\\t<div class=\\"show-title\\">\uC18C\uAC1C</div>\\r\\n\\t\\t\\t\\t\\t<div class=\\"show-content\\">\\r\\n\\t\\t\\t\\t\\t\\t<div class=\\"show-follow\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\uD314\uB85C\uC6CC <span class=\\"show-bold\\">{res.follower.length}</span>\\r\\n\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t\\t<div class=\\"show-follow\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\uD314\uB85C\uC789 <span class=\\"show-bold\\">{res.following.length}</span>\\r\\n\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t\\t<div class=\\"show-follow\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\uC804\uCCB4 \uAE00 <span class=\\"show-bold\\">{res.data.length}</span>\\r\\n\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t\\t<button on:click={follow} class=\\"show-button\\">Follow</button>\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t<div class=\\"post\\">\\r\\n\\t\\t\\t\\t\\t<div class=\\"form\\">\\r\\n\\t\\t\\t\\t\\t\\t<input bind:value={inputtext} type=\\"text\\" placeholder=\\"{res.nickname}\uB2D8\uC5D0\uAC8C \uC804\uD558\uACE0 \uC2F6\uC740 \uB9D0\uC744 \uC785\uB825\uD558\uC138\uC694.\\" />\\r\\n\\t\\t\\t\\t\\t\\t<button on:click={upload}>\uAC8C\uC2DC</button>\\r\\n\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t{#each res.data.reverse() as p, index}\\r\\n\\t\\t\\t\\t\\t\\t<div class=\\"card\\" id=\\"post-{res.data.length - index}-{p.nick}\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t<div class=\\"title\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t<a href=\\"/@{p.nick}/gg\\" class=\\"no-deco\\">{p.nick}</a>{' '}\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t<span class=\\"time\\">{getAgo(p.time)}</span>\\r\\n\\t\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t\\t\\t<div class=\\"content\\">\\r\\n\\t\\t\\t\\t\\t\\t\\t\\t{@html userParser(linkParser(p.content))}\\r\\n\\t\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t\\t\\t{/each}\\r\\n\\t\\t\\t\\t</div>\\r\\n\\t\\t\\t</div>\\r\\n\\t\\t</div>\\r\\n\\t{/if}\\r\\n{/await}\\r\\n\\r\\n<style lang=\\"scss\\">.user-container {\\n  width: 100%;\\n  margin: 0 auto;\\n}\\n.user-container .user {\\n  width: 100%;\\n  height: 120px;\\n  border-bottom: var(--theme-nav-color) solid 1.2px;\\n  padding: 15px 30px;\\n  text-align: center;\\n}\\n.user-container .user .name {\\n  font-size: 1.75rem;\\n  font-weight: light;\\n}\\n.user-container .user .about {\\n  font-size: 0.95rem;\\n  color: var(--theme-gray);\\n}\\n.user-container .main-content {\\n  display: flex;\\n  margin-top: 25px;\\n  width: 75%;\\n  margin: 35px auto;\\n  word-break: break-all;\\n}\\n.user-container .main-content .show {\\n  margin-top: 60px;\\n  margin-right: 5%;\\n  width: 30%;\\n  height: 220px;\\n  border-radius: 15px;\\n  border: 0.1px solid var(--theme-nav-color);\\n  box-shadow: 0 0 1px var(--theme-nav-color);\\n  padding: 15px 22.5px;\\n}\\n.user-container .main-content .show .show-title {\\n  font-weight: bold;\\n  font-size: 1.225rem;\\n}\\n.user-container .main-content .show .show-content {\\n  margin-top: 15px;\\n}\\n.user-container .main-content .show .show-follow {\\n  margin-bottom: 5px;\\n}\\n.user-container .main-content .show .show-bold {\\n  font-weight: bold;\\n}\\n.user-container .main-content .show .show-button {\\n  margin-top: 18px;\\n  width: 100%;\\n  height: 35px;\\n  border-radius: 7px;\\n  outline: none;\\n  border: none;\\n  background-color: var(--theme-nav-color);\\n  transition: all ease 0.2s 0s;\\n}\\n.user-container .main-content .show .show-button:hover {\\n  border: none;\\n  background-color: var(--theme-nav-color-hover);\\n  transition: all ease 0.2s 0s;\\n}\\n.user-container .main-content .post {\\n  width: 70%;\\n}\\n.user-container .main-content .post .card {\\n  box-shadow: 0 0 2.2px var(--theme-nav-color);\\n  width: 100%;\\n  height: auto;\\n  padding: 17px 17px;\\n  border: var(--theme-nav-color) solid 1.5px;\\n  border-radius: 7.5px;\\n  margin: 35px 0;\\n}\\n.user-container .main-content .post .card .title {\\n  font-size: 1rem;\\n  font-weight: bold;\\n}\\n.user-container .main-content .post .card .title .time {\\n  font-weight: lighter;\\n  font-size: 0.75rem;\\n  color: var(--theme-gray);\\n  padding-left: 2px;\\n}\\n.user-container .main-content .post .card .content {\\n  margin-top: 7px;\\n}\\n.user-container .form {\\n  margin: 45px auto;\\n  width: 100%;\\n  display: flex;\\n}\\n.user-container .form input {\\n  margin-top: 15px;\\n  font-size: 13px;\\n  min-width: 90%;\\n  height: 38px;\\n  border-radius: 7px;\\n  padding: 0px 15px;\\n  outline: none;\\n  border: 1.5px solid var(--theme-nav-color);\\n  transition: all ease 0.2s 0s;\\n  color: var(--theme-color);\\n  background-color: var(--theme-background);\\n}\\n.user-container .form input:focus {\\n  border: 1.5px solid var(--blue);\\n  outline: none;\\n  transition: all ease 0.2s 0s;\\n}\\n.user-container .form button {\\n  margin-top: 15px;\\n  margin-left: 5px;\\n  width: 100%;\\n  border-radius: 5px;\\n  outline: none;\\n  border: none;\\n  height: 38px;\\n  background-color: var(--blue);\\n  color: #ffffff;\\n  font-weight: bold;\\n}</style>\\r\\n"],"names":[],"mappings":"AAqHmB,eAAe,8BAAC,CAAC,AAClC,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CAAC,IAAI,AAChB,CAAC,AACD,8BAAe,CAAC,KAAK,eAAC,CAAC,AACrB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,KAAK,CACb,aAAa,CAAE,IAAI,iBAAiB,CAAC,CAAC,KAAK,CAAC,KAAK,CACjD,OAAO,CAAE,IAAI,CAAC,IAAI,CAClB,UAAU,CAAE,MAAM,AACpB,CAAC,AACD,8BAAe,CAAC,KAAK,CAAC,KAAK,eAAC,CAAC,AAC3B,SAAS,CAAE,OAAO,CAClB,WAAW,CAAE,KAAK,AACpB,CAAC,AACD,8BAAe,CAAC,KAAK,CAAC,MAAM,eAAC,CAAC,AAC5B,SAAS,CAAE,OAAO,CAClB,KAAK,CAAE,IAAI,YAAY,CAAC,AAC1B,CAAC,AACD,8BAAe,CAAC,aAAa,eAAC,CAAC,AAC7B,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IAAI,CAChB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,IAAI,CAAC,IAAI,CACjB,UAAU,CAAE,SAAS,AACvB,CAAC,AACD,8BAAe,CAAC,aAAa,CAAC,KAAK,eAAC,CAAC,AACnC,UAAU,CAAE,IAAI,CAChB,YAAY,CAAE,EAAE,CAChB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,KAAK,CACb,aAAa,CAAE,IAAI,CACnB,MAAM,CAAE,KAAK,CAAC,KAAK,CAAC,IAAI,iBAAiB,CAAC,CAC1C,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,IAAI,iBAAiB,CAAC,CAC1C,OAAO,CAAE,IAAI,CAAC,MAAM,AACtB,CAAC,AACD,8BAAe,CAAC,aAAa,CAAC,KAAK,CAAC,WAAW,eAAC,CAAC,AAC/C,WAAW,CAAE,IAAI,CACjB,SAAS,CAAE,QAAQ,AACrB,CAAC,AACD,8BAAe,CAAC,aAAa,CAAC,KAAK,CAAC,aAAa,eAAC,CAAC,AACjD,UAAU,CAAE,IAAI,AAClB,CAAC,AACD,8BAAe,CAAC,aAAa,CAAC,KAAK,CAAC,YAAY,eAAC,CAAC,AAChD,aAAa,CAAE,GAAG,AACpB,CAAC,AACD,8BAAe,CAAC,aAAa,CAAC,KAAK,CAAC,UAAU,eAAC,CAAC,AAC9C,WAAW,CAAE,IAAI,AACnB,CAAC,AACD,8BAAe,CAAC,aAAa,CAAC,KAAK,CAAC,YAAY,eAAC,CAAC,AAChD,UAAU,CAAE,IAAI,CAChB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,IAAI,iBAAiB,CAAC,CACxC,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CAAC,EAAE,AAC9B,CAAC,AACD,8BAAe,CAAC,aAAa,CAAC,KAAK,CAAC,2BAAY,MAAM,AAAC,CAAC,AACtD,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,IAAI,uBAAuB,CAAC,CAC9C,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CAAC,EAAE,AAC9B,CAAC,AACD,8BAAe,CAAC,aAAa,CAAC,KAAK,eAAC,CAAC,AACnC,KAAK,CAAE,GAAG,AACZ,CAAC,AACD,8BAAe,CAAC,aAAa,CAAC,KAAK,CAAC,KAAK,eAAC,CAAC,AACzC,UAAU,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,IAAI,iBAAiB,CAAC,CAC5C,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IAAI,CAAC,IAAI,CAClB,MAAM,CAAE,IAAI,iBAAiB,CAAC,CAAC,KAAK,CAAC,KAAK,CAC1C,aAAa,CAAE,KAAK,CACpB,MAAM,CAAE,IAAI,CAAC,CAAC,AAChB,CAAC,AACD,8BAAe,CAAC,aAAa,CAAC,KAAK,CAAC,KAAK,CAAC,MAAM,eAAC,CAAC,AAChD,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,IAAI,AACnB,CAAC,AACD,8BAAe,CAAC,aAAa,CAAC,KAAK,CAAC,KAAK,CAAC,MAAM,CAAC,KAAK,eAAC,CAAC,AACtD,WAAW,CAAE,OAAO,CACpB,SAAS,CAAE,OAAO,CAClB,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,YAAY,CAAE,GAAG,AACnB,CAAC,AACD,8BAAe,CAAC,aAAa,CAAC,KAAK,CAAC,KAAK,CAAC,QAAQ,eAAC,CAAC,AAClD,UAAU,CAAE,GAAG,AACjB,CAAC,AACD,8BAAe,CAAC,KAAK,eAAC,CAAC,AACrB,MAAM,CAAE,IAAI,CAAC,IAAI,CACjB,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IAAI,AACf,CAAC,AACD,8BAAe,CAAC,KAAK,CAAC,KAAK,eAAC,CAAC,AAC3B,UAAU,CAAE,IAAI,CAChB,SAAS,CAAE,IAAI,CACf,SAAS,CAAE,GAAG,CACd,MAAM,CAAE,IAAI,CACZ,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,GAAG,CAAC,IAAI,CACjB,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,KAAK,CAAC,KAAK,CAAC,IAAI,iBAAiB,CAAC,CAC1C,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CAAC,EAAE,CAC5B,KAAK,CAAE,IAAI,aAAa,CAAC,CACzB,gBAAgB,CAAE,IAAI,kBAAkB,CAAC,AAC3C,CAAC,AACD,8BAAe,CAAC,KAAK,CAAC,oBAAK,MAAM,AAAC,CAAC,AACjC,MAAM,CAAE,KAAK,CAAC,KAAK,CAAC,IAAI,MAAM,CAAC,CAC/B,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,IAAI,CAAC,EAAE,AAC9B,CAAC,AACD,8BAAe,CAAC,KAAK,CAAC,MAAM,eAAC,CAAC,AAC5B,UAAU,CAAE,IAAI,CAChB,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,IAAI,CACZ,gBAAgB,CAAE,IAAI,MAAM,CAAC,CAC7B,KAAK,CAAE,OAAO,CACd,WAAW,CAAE,IAAI,AACnB,CAAC"}`
};
async function load$1({ page }) {
  return { props: { user: page.params.user } };
}
const U5Buseru5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { user: user2 } = $$props;
  async function loadUser() {
    const res = await fetchApiServer(`/account/profilebynick?nickname=${user2}`);
    return res;
  }
  let promise = loadUser();
  let inputtext = "";
  if ($$props.user === void 0 && $$bindings.user && user2 !== void 0)
    $$bindings.user(user2);
  $$result.css.add(css);
  return `${$$result.head += `${$$result.title = `<title>${escape(user2)} - platform</title>`, ""}`, ""}

${function(__value) {
    if (is_promise(__value)) {
      __value.then(null, noop);
      return ``;
    }
    return function(res) {
      return `
	${res.id === null ? `User Not Found` : `<div class="${"user-container svelte-1kz8au2"}"><div class="${"user svelte-1kz8au2"}"><div class="${"name svelte-1kz8au2"}"><a href="${"/@" + escape(res.nickname)}" class="${"no-deco"}">${escape(res.nickname)}</a>
					${ADMIN.includes(res.id) ? `${validate_component(Badge, "Badge").$$render($$result, {}, {}, { default: () => `\uC778\uC99D\uB428` })}` : ``}</div>
				<div class="${"about svelte-1kz8au2"}">${escape(res.about)}</div></div>
			<div class="${"main-content svelte-1kz8au2"}"><div class="${"show svelte-1kz8au2"}"><div class="${"show-title svelte-1kz8au2"}">\uC18C\uAC1C</div>
					<div class="${"show-content svelte-1kz8au2"}"><div class="${"show-follow svelte-1kz8au2"}">\uD314\uB85C\uC6CC <span class="${"show-bold svelte-1kz8au2"}">${escape(res.follower.length)}</span></div>
						<div class="${"show-follow svelte-1kz8au2"}">\uD314\uB85C\uC789 <span class="${"show-bold svelte-1kz8au2"}">${escape(res.following.length)}</span></div>
						<div class="${"show-follow svelte-1kz8au2"}">\uC804\uCCB4 \uAE00 <span class="${"show-bold svelte-1kz8au2"}">${escape(res.data.length)}</span></div>
						<button class="${"show-button svelte-1kz8au2"}">Follow</button></div></div>
				<div class="${"post svelte-1kz8au2"}"><div class="${"form svelte-1kz8au2"}"><input type="${"text"}" placeholder="${escape(res.nickname) + "\uB2D8\uC5D0\uAC8C \uC804\uD558\uACE0 \uC2F6\uC740 \uB9D0\uC744 \uC785\uB825\uD558\uC138\uC694."}" class="${"svelte-1kz8au2"}"${add_attribute("value", inputtext, 0)}>
						<button class="${"svelte-1kz8au2"}">\uAC8C\uC2DC</button></div>
					${each(res.data.reverse(), (p, index2) => `<div class="${"card svelte-1kz8au2"}" id="${"post-" + escape(res.data.length - index2) + "-" + escape(p.nick)}"><div class="${"title svelte-1kz8au2"}"><a href="${"/@" + escape(p.nick) + "/gg"}" class="${"no-deco"}">${escape(p.nick)}</a>${escape(" ")}
								<span class="${"time svelte-1kz8au2"}">${escape(getAgo(p.time))}</span></div>
							<div class="${"content svelte-1kz8au2"}"><!-- HTML_TAG_START -->${userParser(linkParser(p.content))}<!-- HTML_TAG_END --></div>
						</div>`)}</div></div></div>`}
`;
    }(__value);
  }(promise)}`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": U5Buseru5D,
  load: load$1
});
async function load({ page }) {
  return { props: { user: page.params.user } };
}
const Gg = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { user: user2 } = $$props;
  if (typeof window !== "undefined") {
    window.location.replace(`/@${user2}`);
  }
  if ($$props.user === void 0 && $$bindings.user && user2 !== void 0)
    $$bindings.user(user2);
  return ``;
});
var gg = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Gg,
  load
});
export { init, render };

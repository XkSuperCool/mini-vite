var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});

// src/node/cli.ts
import cac from "cac";

// src/server/index.ts
import connect from "connect";
import { blue, green as green2 } from "picocolors";

// src/node/optimizer/index.ts
import path3 from "path";
import { build } from "esbuild";
import { green } from "picocolors";

// src/node/constants.ts
import path from "path";
var EXTERNAL_TYPES = [
  "css",
  "less",
  "sass",
  "scss",
  "styl",
  "stylus",
  "pcss",
  "postcss",
  "vue",
  "svelte",
  "marko",
  "astro",
  "png",
  "jpe?g",
  "gif",
  "svg",
  "ico",
  "webp",
  "avif"
];
var BARE_IMPORT_RE = /^[\w@][^:]/;
var PRE_BUNDLE_DIR = path.resolve("node_modules", ".m-vite");

// src/node/optimizer/scanPlugin.ts
function scanPlugin(deps) {
  return {
    name: "esbuild:scan-deps",
    setup(build2) {
      build2.onResolve({ filter: new RegExp(`\\.(${EXTERNAL_TYPES.join("|")})$`) }, (options) => {
        return {
          path: options.path,
          external: true
        };
      });
      build2.onResolve({ filter: BARE_IMPORT_RE }, (options) => {
        const id = options.path;
        deps.add(id);
        return {
          path: id,
          external: true
        };
      });
    }
  };
}

// src/node/optimizer/preBundlePlugin.ts
import fse from "fs-extra";
import resolve from "resolve";
import path2 from "path";
import createDebug from "debug";
import { init, parse } from "es-module-lexer";
var debug = createDebug("dev");
function preBuildPlugin(deps) {
  return {
    name: "esbuild:pre-build",
    setup(build2) {
      build2.onResolve({ filter: BARE_IMPORT_RE }, (resolveInfo) => {
        const { path: id, importer } = resolveInfo;
        const isEntry = !importer;
        if (deps.has(id)) {
          return isEntry ? {
            path: id,
            namespace: "dep"
          } : {
            path: resolve.sync(id, { basedir: process.cwd() })
          };
        }
      });
      build2.onLoad({ filter: /.*/, namespace: "dep" }, async (options) => {
        await init;
        const id = options.path;
        const root = process.cwd();
        const entryPath = resolve.sync(id, { basedir: root });
        const code = await fse.readFile(entryPath, "utf-8");
        const [imports, exports] = await parse(code);
        const proxyModule = [];
        if (!imports.length && !exports.length) {
          const specifiers = Object.keys(__require(entryPath));
          proxyModule.push(
            `export { ${specifiers.join(",")} } from '${entryPath}'`,
            `export default require('${entryPath}')`
          );
        } else {
          if (exports.includes("default")) {
            proxyModule.push(`import d from '${entryPath}'; export default d`);
          }
          proxyModule.push(`export * from '${entryPath}'`);
        }
        debug("proxy module: ", proxyModule.join("\n"));
        return {
          resolveDir: root,
          contents: proxyModule.join("\n"),
          loader: path2.extname(entryPath).slice(1)
        };
      });
    }
  };
}

// src/node/optimizer/index.ts
async function optimizer(root) {
  const entry = path3.resolve(root, "src/main.tsx");
  const deps = /* @__PURE__ */ new Set();
  await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    plugins: [scanPlugin(deps)]
  });
  console.log(
    green("\u9700\u8981\u9884\u6784\u5EFA\u7684\u4F9D\u8D56\u6709: \n"),
    Array.from(deps).map(green).map((item) => `	${item}`).join("\n")
  );
  await build({
    entryPoints: [...deps],
    write: true,
    bundle: true,
    format: "esm",
    splitting: true,
    outdir: path3.resolve(root, PRE_BUNDLE_DIR),
    plugins: [preBuildPlugin(deps)]
  });
}

// src/server/index.ts
async function startDevServer() {
  const app = connect();
  const root = process.cwd();
  const startTime = Date.now();
  app.listen(3e3, async () => {
    await optimizer(root);
    console.log(
      green2("\u{1F680} No-Bundle server restart done!"),
      `${Date.now() - startTime}ms`
    );
    console.log(`> local path: ${blue("http://localhost:3000")}`);
  });
}

// src/node/cli.ts
var cli = cac();
cli.command("[root]", "Run the development serve").alias("serve").alias("dev").action(async () => {
  await startDevServer();
});
cli.help();
cli.parse();
//# sourceMappingURL=index.mjs.map
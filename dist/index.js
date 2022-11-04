"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/node/cli.ts
var import_cac = __toESM(require("cac"));

// src/server/index.ts
var import_connect = __toESM(require("connect"));
var import_picocolors2 = require("picocolors");

// src/node/optimizer/index.ts
var import_path3 = __toESM(require("path"));
var import_esbuild = require("esbuild");
var import_picocolors = require("picocolors");

// src/node/constants.ts
var import_path = __toESM(require("path"));
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
var PRE_BUNDLE_DIR = import_path.default.resolve("node_modules", ".m-vite");

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
var import_fs_extra = __toESM(require("fs-extra"));
var import_resolve = __toESM(require("resolve"));
var import_path2 = __toESM(require("path"));
var import_debug = __toESM(require("debug"));
var import_es_module_lexer = require("es-module-lexer");
var debug = (0, import_debug.default)("dev");
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
            path: import_resolve.default.sync(id, { basedir: process.cwd() })
          };
        }
      });
      build2.onLoad({ filter: /.*/, namespace: "dep" }, async (options) => {
        await import_es_module_lexer.init;
        const id = options.path;
        const root = process.cwd();
        const entryPath = import_resolve.default.sync(id, { basedir: root });
        const code = await import_fs_extra.default.readFile(entryPath, "utf-8");
        const [imports, exports] = await (0, import_es_module_lexer.parse)(code);
        const proxyModule = [];
        if (!imports.length && !exports.length) {
          const specifiers = Object.keys(require(entryPath));
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
          loader: import_path2.default.extname(entryPath).slice(1)
        };
      });
    }
  };
}

// src/node/optimizer/index.ts
async function optimizer(root) {
  const entry = import_path3.default.resolve(root, "src/main.tsx");
  const deps = /* @__PURE__ */ new Set();
  await (0, import_esbuild.build)({
    entryPoints: [entry],
    bundle: true,
    write: false,
    plugins: [scanPlugin(deps)]
  });
  console.log(
    (0, import_picocolors.green)("\u9700\u8981\u9884\u6784\u5EFA\u7684\u4F9D\u8D56\u6709: \n"),
    Array.from(deps).map(import_picocolors.green).map((item) => `	${item}`).join("\n")
  );
  await (0, import_esbuild.build)({
    entryPoints: [...deps],
    write: true,
    bundle: true,
    format: "esm",
    splitting: true,
    outdir: import_path3.default.resolve(root, PRE_BUNDLE_DIR),
    plugins: [preBuildPlugin(deps)]
  });
}

// src/server/index.ts
async function startDevServer() {
  const app = (0, import_connect.default)();
  const root = process.cwd();
  const startTime = Date.now();
  app.listen(3e3, async () => {
    await optimizer(root);
    console.log(
      (0, import_picocolors2.green)("\u{1F680} No-Bundle server restart done!"),
      `${Date.now() - startTime}ms`
    );
    console.log(`> local path: ${(0, import_picocolors2.blue)("http://localhost:3000")}`);
  });
}

// src/node/cli.ts
var cli = (0, import_cac.default)();
cli.command("[root]", "Run the development serve").alias("serve").alias("dev").action(async () => {
  await startDevServer();
});
cli.help();
cli.parse();
//# sourceMappingURL=index.js.map
// src/node/cli.ts
import cac from "cac";

// src/server/index.ts
import connect from "connect";
import { blue, green } from "picocolors";

// src/node/optimizer/index.ts
async function optimizer(root) {
}

// src/server/index.ts
async function startDevServer() {
  const app = connect();
  const root = process.cwd();
  const startTime = Date.now();
  app.listen(3e3, async () => {
    await optimizer();
    console.log(
      green("\u{1F680} No-Bundle server restart done!"),
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
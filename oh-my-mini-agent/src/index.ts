import { runCli } from "./cli/cli.js";
import { loadDotEnv } from "./runtime/env.js";

loadDotEnv();

await runCli(process.argv.slice(2));

#!/usr/bin/env node
import { program } from "commander";
import { build } from "./build";
import { serve } from "./serve";

program
  .command("build")
  .option("-w, --watch", "Watch mode", false)
  .requiredOption("-o, --outdir <output-dir>", "Output directory", "dist")
  .requiredOption("--outbase <outbase>", "Output base directory")
  .argument("<input...>")
  .action(async (input: string[], options) => {
    await build(input, options);
  });

program
  .command("serve")
  .argument("<dir>")
  .option("-p, --port", "Port number", "8080")
  .action(async (dir, options) => {
    await serve(dir, options);
  });

program.parse(process.argv);

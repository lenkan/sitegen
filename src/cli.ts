#!/usr/bin/env node
import { program } from "commander";
import { build } from "./build";
import { serve } from "./serve";

program
  .command("build")
  .option("-w, --watch", "Watch mode", false)
  .requiredOption("-o, --outdir <output-dir>", "Output directory", "dist")
  .requiredOption("-i, --inputdir <input-dir>", "Input directory", "src/pages")
  .action(async (options) => {
    await build(options);
  });

program
  .command("serve")
  .argument("<dir>")
  .option("-p, --port", "Port number", "8080")
  .action(async (dir, options) => {
    await serve(dir, options);
  });

program.parse(process.argv);

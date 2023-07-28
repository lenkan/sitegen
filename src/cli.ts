#!/usr/bin/env node
import { program } from "commander";
import { build } from "./build";
import { serve } from "./serve";

program
  .command("build")
  .argument("<input>")
  .argument("<output-dir>")
  .option("-w, --watch", "Watch mode", false)
  .action(async (input, outputDir, args) => {
    await build(input, outputDir, args);
  });

program
  .command("serve")
  .argument("<dir>")
  .option("-p, --port", "Port number", "8080")
  .action(async (dir, options) => {
    await serve(dir, options);
  });

program.parse(process.argv);

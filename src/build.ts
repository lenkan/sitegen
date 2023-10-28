import esbuild from "esbuild";
import fs, { mkdir, writeFile } from "fs/promises";
import path from "path";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { renderServerPage } from "./render";
import { AppModule } from "./api";

async function loadModule(pathname: string): Promise<AppModule> {
  const mod = (await import(pathname + "?" + Date.now())) as { default: AppModule };
  return mod.default;
}

export interface BuildArgs {
  watch?: boolean;
  outdir: string;
  outbase: string;
}

function replaceExtention(name: string, extension: string) {
  return path.format({ ...path.parse(name), base: "", ext: extension });
}

function findBundle(entryPoint: string, metafile: esbuild.Metafile) {
  for (const [pathname, info] of Object.entries(metafile.outputs)) {
    if (info.entryPoint === entryPoint) {
      return { pathname, info };
    }
  }

  return null;
}

export async function build(inputs: string[], args: BuildArgs) {
  await fs.mkdir(args.outdir, { recursive: true }).catch(() => {});

  const options: esbuild.BuildOptions = {
    bundle: true,
    minify: true,
    sourcemap: true,
    platform: "browser",
    format: "esm",
    metafile: true,
    loader: {
      ".jpeg": "file",
      ".svg": "file",
      ".module.css": "local-css",
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
    },
    entryPoints: inputs,
    entryNames: "[dir]/[name]-[hash]",
    outdir: args.outdir,
    outbase: args.outbase,
    write: false,
    plugins: [
      {
        name: "html",
        setup: async (build) => {
          build.onEnd(async (result) => {
            await Promise.all(
              result.outputFiles.map(async (file) => {
                await mkdir(path.dirname(file.path), { recursive: true });
                await writeFile(file.path, file.contents);
                console.log("Wrote %s", file.path);
              })
            );

            for (const entryPoint of inputs) {
              const bundle = findBundle(entryPoint, result.metafile);

              if (!bundle) {
                throw new Error("Could not determine entrypoint for " + entryPoint);
              }

              const mod = await loadModule(path.resolve(bundle.pathname));

              const htmlfile = path.join(
                args.outdir,
                path.relative(args.outbase, replaceExtention(entryPoint, ".html"))
              );
              await mkdir(path.dirname(htmlfile), { recursive: true });

              await writeFile(
                htmlfile,
                renderServerPage(renderToString(createElement(() => mod.component)), {
                  styles: ["/" + path.relative(args.outdir, bundle.info.cssBundle)],
                  scripts: ["/" + path.relative(args.outdir, bundle.pathname)],
                  title: mod.metadata.title ?? "Lenkan",
                  favicon: mod.metadata.favicon,
                })
              );

              console.log("Wrote %s", htmlfile);
            }
          });
        },
      },
    ],
  };

  if (args.watch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
  } else {
    await esbuild.build(options);
  }
}

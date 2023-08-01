import esbuild from "esbuild";
import fs, { writeFile } from "fs/promises";
import path from "path";
import { ComponentClass, FunctionComponent, createElement } from "react";
import { renderToString } from "react-dom/server";

interface TemplateProps {
  styles: string[];
  scripts: string[];
  title: string;
}

function renderStyle(script: string) {
  return `<link rel="stylesheet" href="${script}" />`;
}

function renderScript(script: string) {
  return `<script async src="${script}"></script>`;
}

const renderServerPage = (body: string, props: TemplateProps) => `
<!DOCTYPE html>
<html>
  <head>
    <title>${props.title}</title>
    ${props.styles.map(renderStyle).join("\n")}
    ${props.scripts.map(renderScript).join("\n")}
  </head>
  <body>
    <div id="root">${body}</div>
  </body>
</html>
`;

interface AppModule {
  component: FunctionComponent<AppComponentProps> | ComponentClass<AppComponentProps>;
  routes: Record<string, { title?: string }>;
}

interface AppComponentProps {
  location: { pathname: string; origin: string };
}

async function loadModule(pathname: string): Promise<AppModule> {
  const mod = (await import(pathname + "?" + Date.now())) as { default: AppModule };
  return mod.default;
}

export async function build(input: string, outputDir: string, args: Record<string, string | boolean | undefined>) {
  await fs.mkdir(outputDir, { recursive: true }).catch(() => {});

  const options: esbuild.BuildOptions = {
    bundle: true,
    minify: false,
    sourcemap: true,
    platform: "browser",
    format: "esm",
    external: ["react", "react-dom"],
    splitting: false,
    loader: {
      ".jpeg": "file",
      ".module.css": "local-css",
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
    },
    entryPoints: [input],
    outdir: outputDir,
    write: false,
    plugins: [
      {
        name: "html",
        setup: async (build) => {
          build.onEnd(async (result) => {
            await Promise.all(
              result.outputFiles.map(async (file) => {
                await writeFile(file.path, file.contents);
                console.log("Wrote %s", file.path);
              })
            );

            for (const bundle of result.outputFiles.filter((file) => file.path.endsWith(".js"))) {
              const mod = await loadModule(bundle.path);

              for (const [pathname, { title = "Lenkan" }] of Object.entries(mod.routes)) {
                const htmlfile = path.join(outputDir, pathname === "/" ? "index" : pathname) + ".html";

                await writeFile(
                  htmlfile,
                  renderServerPage(
                    renderToString(
                      createElement(mod.component, {
                        location: { pathname, origin: "https://example.com" },
                      })
                    ),
                    {
                      styles: result.outputFiles
                        .filter((file) => file.path.endsWith(".css"))
                        .map((file) => path.relative(outputDir, file.path)),
                      scripts: result.outputFiles
                        .filter((file) => file.path.endsWith(".js"))
                        .map((file) => path.relative(outputDir, file.path)),
                      title: title ?? "Lenkan",
                    }
                  )
                );

                console.log("Wrote %s", htmlfile);
              }

              await esbuild.build({
                bundle: true,
                minify: true,
                sourcemap: true,
                platform: "browser",
                format: "iife",
                splitting: false,
                define: {
                  "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV ?? "development"),
                },
                entryPoints: [bundle.path],
                allowOverwrite: true,
                outdir: outputDir,
                write: true,
              });
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

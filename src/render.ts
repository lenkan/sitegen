function renderStyle(script: string) {
  return `<link rel="stylesheet" href="${script}" />`;
}

function renderScript(script: string) {
  return `<script async src="${script}"></script>`;
}

export interface TemplateProps {
  styles: string[];
  scripts: string[];
  title: string;
  favicon?: string;
}

export function renderServerPage(body: string, props: TemplateProps) {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>${props.title}</title>
    ${props.favicon ? `<link rel="icon" href="${props.favicon}">` : ""}
    ${props.styles.map(renderStyle).join("\n")}
    ${props.scripts.map(renderScript).join("\n")}
  </head>
  <body>
    <div id="root">${body}</div>
  </body>
</html>
`;
}

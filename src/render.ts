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
}

export function renderServerPage(body: string, props: TemplateProps) {
  return `<!DOCTYPE html>
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
}

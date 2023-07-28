# Static site generator

This is a simple static site generator using esbuild and react.

## Installation

```
npm i @lenkan/sitegen
```

## Usage

Create an entrypoint app.tsx

```typescript
import { render } from "@lenkan/sitegen";

export default render({
  "/": {
    component: function App() {
      return <div>Hello world</div>;
    },
  },
});
```

Build the output

```
npx sitegen app.tsx dist
```

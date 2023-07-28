import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { URLPattern } from "urlpattern-polyfill";

export interface Routes {
  [path: string]: Route;
}

export interface Route {
  title: string;
  component: any;
}

export interface AppProps {
  location: Location;
}

export interface Application {
  component: any;
  routes: Routes;
}

export function render(routes: Routes) {
  function App(props: AppProps) {
    for (const [path, route] of Object.entries(routes)) {
      const pattern = new URLPattern(path, props.location.origin);

      if (pattern.test(props.location.pathname, props.location.origin)) {
        return route.component();
      }
    }

    return createElement("div", "Not found");
  }

  function mount() {
    const root = document.getElementById("root");

    if (root) {
      hydrateRoot(root, createElement(App, { location: window.location }));
    }
  }

  if (typeof window !== "undefined") {
    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", mount);
    } else {
      mount();
    }
  }

  return {
    component: App,
    routes,
  };
}

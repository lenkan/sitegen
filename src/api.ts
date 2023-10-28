import { ReactNode } from "react";
import { hydrateRoot } from "react-dom/client";

export interface Metadata {
  favicon?: string;
  title?: string;
}

export interface AppModule {
  component: ReactNode;
  metadata: Metadata;
}

export function render(app: ReactNode, metadata: Metadata): AppModule {
  function mount() {
    const root = document.getElementById("root");

    if (root) {
      hydrateRoot(root, app);
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
    component: app,
    metadata,
  };
}

import { render, type RenderOptions } from "@gpuix/react";
import type { ReactNode } from "react";

export interface Application {
  id: string;
  name: string;
  window: Pick<RenderOptions, "width" | "height" | "minWidth" | "minHeight">;
}

export function defineApplication<const Definition extends Application>(
  definition: Definition,
): Definition {
  return definition;
}

export function startApplication(application: Application, content: ReactNode) {
  return render(content, {
    ...application.window,
    title: application.name,
    appName: application.name,
    tabNavigation: true,
    keyboardFocusDim: false,
  });
}

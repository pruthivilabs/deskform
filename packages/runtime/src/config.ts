import type { RenderOptions } from "@gpuix/react";
export interface Application {
  readonly id: string;
  readonly name: string;
  readonly window: Readonly<
    Pick<
      RenderOptions,
      | "width"
      | "height"
      | "minWidth"
      | "minHeight"
      | "resizable"
      | "titlebarTransparent"
      | "windowBackground"
      | "trafficLightX"
      | "trafficLightY"
    >
  >;
}
export function defineApplication(definition: Application): Application {
  return Object.freeze({ ...definition, window: Object.freeze({ ...definition.window }) });
}
export function applicationWindowOptions(application: Application): RenderOptions {
  return {
    ...application.window,
    appId: application.id,
    title: application.name,
    appName: application.name,
    tabNavigation: true,
    keyboardFocusDim: false,
  };
}

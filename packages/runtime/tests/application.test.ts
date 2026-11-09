import { expect, it } from "vite-plus/test";
import { defineApplication, applicationWindowOptions } from "@deskform/runtime/config";
it("snapshots native configuration and resolves host behavior from the application declaration", () => {
  const source = {
    id: "dev.example.utility",
    name: "Utility",
    window: { width: 960, height: 640, titlebarTransparent: true },
  };
  const application = defineApplication(source);
  source.name = "Changed";
  source.window.width = 100;
  const options = applicationWindowOptions(application);
  expect(options).toMatchObject({
    appId: "dev.example.utility",
    title: "Utility",
    width: 960,
    height: 640,
    titlebarTransparent: true,
    tabNavigation: true,
    keyboardFocusDim: false,
  });
  expect(Object.isFrozen(application.window)).toBe(true);
});

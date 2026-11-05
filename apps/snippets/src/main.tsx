import { render } from "@gpuix/react";
import { App } from "./app";
import { identity } from "./identity";

render(<App />, {
  title: identity.name,
  appName: identity.name,
  width: 1000,
  height: 700,
  minWidth: 760,
  minHeight: 500,
  keyboardFocusDim: false,
});

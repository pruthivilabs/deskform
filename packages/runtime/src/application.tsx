import { render, type KeyEvent } from "@gpuix/react";
import type { ReactNode } from "react";
import { AppFrame } from "@deskform/ui";
import { applicationWindowOptions, type Application } from "./config";
export { defineApplication, type Application } from "./config";
export interface ApplicationPorts {
  toolbar?: ReactNode;
  sidebar?: ReactNode;
  inspector?: ReactNode;
  status?: ReactNode;
  content: ReactNode;
  commands?: { onKeyDown: (event: KeyEvent) => void };
}
export function composeApplication(application: Application, ports: ApplicationPorts) {
  return {
    application,
    element: (
      <AppFrame
        role="application"
        aria-label={application.name}
        toolbar={ports.toolbar}
        sidebar={ports.sidebar}
        inspector={ports.inspector}
        status={ports.status}
        onKeyDown={ports.commands?.onKeyDown}
      >
        {ports.content}
      </AppFrame>
    ),
  };
}
export type ApplicationComposition = ReturnType<typeof composeApplication>;
export function startApplication(composition: ApplicationComposition) {
  return render(composition.element, applicationWindowOptions(composition.application));
}

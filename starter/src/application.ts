import { defineApplication } from "@deskform/runtime/config";
export const application = defineApplication({
  id: "dev.example.utility",
  name: "My Utility",
  window: { width: 1000, height: 700, minWidth: 760, minHeight: 500 },
});

import { defineApplication, startApplication } from "@deskform/runtime";
import { Workbench } from "./workbench";
const application = defineApplication({
  id: "dev.deskform.verification",
  name: "Deskform verification",
  window: { width: 1000, height: 700, minWidth: 760, minHeight: 500 },
});
startApplication(application, <Workbench tuningFile={process.env.DESKFORM_TUNING_FILE} />);

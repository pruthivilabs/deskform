import { startApplication } from "@deskform/runtime";
import { application } from "./application";
import { Workbench } from "./workbench";
startApplication({
  application,
  element: <Workbench tuningFile={process.env.DESKFORM_TUNING_FILE} />,
});

import { startApplication } from "@deskform/runtime";
import { application } from "./application";
import { App } from "./app";
startApplication({ application, element: <App /> });

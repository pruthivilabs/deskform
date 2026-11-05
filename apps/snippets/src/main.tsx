import { startApplication } from "@deskform/runtime";
import { App } from "./app";
import { application } from "./identity";
import { SnippetRepository, defaultDataDirectory } from "./repository";
import { SnippetStore } from "./store";
startApplication(
  application,
  <App store={new SnippetStore(new SnippetRepository(defaultDataDirectory()))} />,
);

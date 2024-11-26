import { ITemplateClient } from "nhs-notify-templates-client";
import { createTemplate } from "./create-template";
import { updateTemplate } from "./update-template";
import { getTemplate } from "./get-template";

export const app: ITemplateClient = {
  createTemplate,
  updateTemplate,
  getTemplate
}

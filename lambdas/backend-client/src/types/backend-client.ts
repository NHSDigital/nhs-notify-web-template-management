import { IFunctionsClient } from './functions-client';
import { ITemplateClient } from './template-client';

export interface IBackendClient {
  functions: IFunctionsClient;
  templates: ITemplateClient;
}

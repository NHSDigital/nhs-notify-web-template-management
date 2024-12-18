import { FunctionsApiClient } from './functions-api-client';
import { TemplateApiClient } from './template-api-client';
import { IBackendClient } from './types/backend-client';
import { IFunctionsClient } from './types/functions-client';
import { ITemplateClient } from './types/template-client';

export class BackendApiClient implements IBackendClient {
  public readonly templates: ITemplateClient;

  public readonly functions: IFunctionsClient;

  constructor(
    _token: string,
    templates?: ITemplateClient,
    functions?: IFunctionsClient
  ) {
    this.templates = templates || new TemplateApiClient(_token);
    this.functions = functions || new FunctionsApiClient(_token);
  }
}

export const BackendClient = (token: string) => new BackendApiClient(token);

import { TemplateApiClient } from './template-api-client';
import { IBackendClient } from './types/backend-client';
import { ITemplateClient } from './types/template-client';

export class BackendApiClient implements IBackendClient {
  public readonly templates: ITemplateClient;

  constructor(_token: string, templates?: ITemplateClient) {
    this.templates = templates || new TemplateApiClient(_token);
  }
}

export const BackendClient = (token: string) => new BackendApiClient(token);

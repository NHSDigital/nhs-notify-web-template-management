import { mockDeep } from 'jest-mock-extended';
import { BackendApiClient, BackendClient } from '../backend-api-client';
import { FunctionsApiClient } from '../functions-api-client';
import { TemplateApiClient } from '../template-api-client';
import { IFunctionsClient } from '../types/functions-client';
import { ITemplateClient } from '../types/template-client';

jest.mock('../template-api-client');
jest.mock('../functions-api-client');

const functionsApiMock = mockDeep<IFunctionsClient>();
const templatesApiMock = mockDeep<ITemplateClient>();

describe('BackendAPIClient', () => {
  test('should default to concrete implementation', async () => {
    BackendClient('token');

    expect(FunctionsApiClient).toHaveBeenCalledWith('token');
    expect(TemplateApiClient).toHaveBeenCalledWith('token');
  });

  test('should use passed in clients', async () => {
    const client = new BackendApiClient(
      'token',
      templatesApiMock,
      functionsApiMock
    );

    expect(client.templates).toBe(templatesApiMock);
    expect(client.functions).toBe(functionsApiMock);
  });
});

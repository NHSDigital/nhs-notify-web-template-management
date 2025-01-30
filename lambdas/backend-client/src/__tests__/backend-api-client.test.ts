import { mockDeep } from 'jest-mock-extended';
import { BackendApiClient, BackendClient } from '../backend-api-client';
import { TemplateApiClient } from '../template-api-client';
import { ITemplateClient } from '../types/template-client';

jest.mock('../template-api-client');

const templatesApiMock = mockDeep<ITemplateClient>();
const testToken = '000';

describe('BackendAPIClient', () => {
  test('should default to concrete implementation', async () => {
    BackendClient(testToken);

    expect(TemplateApiClient).toHaveBeenCalledWith(testToken);
  });

  test('should use passed in clients', async () => {
    const client = new BackendApiClient(testToken, templatesApiMock);

    expect(client.templates).toBe(templatesApiMock);
  });
});

import { ClientConfigRepository } from '../../infra/client-config-repository';
import {
  SSMClient,
  GetParameterCommand,
  ParameterNotFound,
} from '@aws-sdk/client-ssm';
import { mockClient } from 'aws-sdk-client-mock';
import { mock } from 'jest-mock-extended';
import NodeCache from 'node-cache';
import { ClientConfiguration } from 'nhs-notify-backend-client';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';

function setup() {
  const ssmClient = mockClient(SSMClient);
  const cache = mock<NodeCache>();

  const { logger } = createMockLogger();

  const mocks = {
    ssmClient,
    cache,
    logger,
  };

  return { mocks };
}

const mockSSMKeyPrefix = '/test-csi/clients';
const mockClientId = 'test-client-123';
const mockKey = `${mockSSMKeyPrefix}/${mockClientId}`;

const validClient: ClientConfiguration = {
  campaignIds: ['campaign-123'],
  features: {
    proofing: true,
  },
};

describe('ClientConfigRepository', () => {
  beforeEach(jest.resetAllMocks);

  describe('get', () => {
    describe('when client config is not cached', () => {
      it('should fetch from SSM, parse, cache and return valid client config', async () => {
        const {
          mocks: { ssmClient, cache },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache
        );

        const mockSSMResponse = {
          Parameter: {
            Value: JSON.stringify(validClient),
          },
        };

        ssmClient.on(GetParameterCommand).resolvesOnce(mockSSMResponse);

        const result = await repository.get(mockClientId);

        expect(cache.set).toHaveBeenCalledWith(mockKey, validClient);

        expect(result).toEqual({ data: validClient });
      });

      it('should handle client config without campaignId', async () => {
        const {
          mocks: { ssmClient, cache },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache
        );

        const clientWithoutCampaign: ClientConfiguration = {
          features: {
            proofing: false,
          },
        };
        const mockSSMResponse = {
          Parameter: {
            Value: JSON.stringify(clientWithoutCampaign),
          },
        };
        ssmClient.on(GetParameterCommand).resolvesOnce(mockSSMResponse);

        const result = await repository.get(mockClientId);

        expect(result).toEqual({ data: clientWithoutCampaign });
        expect(cache.set).toHaveBeenCalledWith(mockKey, clientWithoutCampaign);
      });

      it('should parse JSON string from SSM parameter value', async () => {
        const {
          mocks: { ssmClient, cache },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache
        );

        const jsonString = '{"campaignId":"test","features":{"proofing":true}}';
        const mockSSMResponse = {
          Parameter: {
            Value: jsonString,
          },
        };
        ssmClient.on(GetParameterCommand).resolvesOnce(mockSSMResponse);

        const result = await repository.get(mockClientId);

        expect(result).toEqual({
          data: {
            campaignId: 'test',
            features: { proofing: true },
          },
        });
      });

      it('should return a failure result when SSM parameter value is invalid JSON', async () => {
        const {
          mocks: { ssmClient, cache },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache
        );

        const mockSSMResponse = {
          Parameter: {
            Value: 'invalid-json-string',
          },
        };

        ssmClient.on(GetParameterCommand).resolvesOnce(mockSSMResponse);

        const result = await repository.get(mockClientId);

        expect(result).toMatchObject({
          error: {
            actualError: expect.objectContaining({
              issues: expect.arrayContaining([
                expect.objectContaining({
                  message:
                    'Unexpected token \'i\', "invalid-json-string" is not valid JSON',
                }),
              ]),
            }),
            errorMeta: {
              code: 500,
              description: 'Client configuration is invalid',
            },
          },
        });

        expect(cache.set).not.toHaveBeenCalled();
      });

      it('should return a failure result when SSM parameter value fails schema validation', async () => {
        const {
          mocks: { ssmClient, cache },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache
        );

        const invalidConfig = {
          campaignId: 'test',
          features: {
            proofing: 'not-a-boolean', // Invalid type
          },
        };

        const mockSSMResponse = {
          Parameter: {
            Value: JSON.stringify(invalidConfig),
          },
        };

        ssmClient.on(GetParameterCommand).resolvesOnce(mockSSMResponse);

        const result = await repository.get(mockClientId);

        expect(result).toMatchObject({
          error: {
            actualError: expect.objectContaining({
              issues: expect.arrayContaining([
                expect.objectContaining({
                  message: 'Invalid input: expected boolean, received string',
                }),
              ]),
            }),
            errorMeta: {
              code: 500,
              description: 'Client configuration is invalid',
            },
          },
        });

        expect(cache.set).not.toHaveBeenCalled();
      });

      it('should return a failure result when SSM parameter value is missing required fields', async () => {
        const {
          mocks: { ssmClient, cache },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache
        );

        const incompleteConfig = {
          campaignId: 'test',
        };

        const mockSSMResponse = {
          Parameter: {
            Value: JSON.stringify(incompleteConfig),
          },
        };

        ssmClient.on(GetParameterCommand).resolvesOnce(mockSSMResponse);

        const result = await repository.get(mockClientId);

        expect(result).toMatchObject({
          error: {
            actualError: expect.objectContaining({
              issues: expect.arrayContaining([
                expect.objectContaining({
                  path: ['features'],
                  message: 'Invalid input: expected object, received undefined',
                }),
              ]),
            }),
            errorMeta: {
              code: 500,
              description: 'Client configuration is invalid',
            },
          },
        });
      });

      it('should return a failure result when SSM parameter has no value', async () => {
        const {
          mocks: { ssmClient, cache },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache
        );

        const mockSSMResponse = {
          Parameter: {},
        };

        ssmClient.on(GetParameterCommand).resolvesOnce(mockSSMResponse);

        const result = await repository.get(mockClientId);

        expect(result).toMatchObject({
          error: {
            actualError: expect.objectContaining({
              issues: expect.arrayContaining([
                expect.objectContaining({
                  message: '"undefined" is not valid JSON',
                }),
              ]),
            }),
            errorMeta: {
              code: 500,
              description: 'Client configuration is invalid',
            },
          },
        });
      });

      it('should return a failure result when SSM response has no parameter', async () => {
        const {
          mocks: { ssmClient, cache },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache
        );

        ssmClient.on(GetParameterCommand).resolvesOnce({});

        const result = await repository.get(mockClientId);

        expect(result).toMatchObject({
          error: {
            actualError: expect.objectContaining({
              issues: expect.arrayContaining([
                expect.objectContaining({
                  message: '"undefined" is not valid JSON',
                }),
              ]),
            }),
            errorMeta: {
              code: 500,
              description: 'Client configuration is invalid',
            },
          },
        });
      });

      it('should return a failure result on SSM client errors', async () => {
        const {
          mocks: { ssmClient, cache },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache
        );

        const ssmError = new Error('SSM service unavailable');

        ssmClient.on(GetParameterCommand).rejectsOnce(ssmError);

        const result = await repository.get(mockClientId);

        expect(result).toMatchObject({
          error: {
            actualError: ssmError,
            errorMeta: {
              code: 500,
              description: 'Failed to fetch client configuration',
            },
          },
        });
      });
    });

    describe('caching behavior', () => {
      it('should cache successfully parsed client config', async () => {
        const {
          mocks: { ssmClient, cache },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache
        );

        cache.get.mockReturnValue(undefined);

        const mockSSMResponse = {
          Parameter: { Value: JSON.stringify(validClient) },
        };

        ssmClient.on(GetParameterCommand).resolvesOnce(mockSSMResponse);

        await repository.get(mockClientId);

        expect(cache.set).toHaveBeenCalledWith(mockKey, validClient);
      });

      it('caches non-existence of configuration parameter', async () => {
        const {
          mocks: { ssmClient, cache },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache
        );

        cache.get.mockReturnValueOnce(undefined);

        const notFoundErr = new ParameterNotFound({
          $metadata: {},
          message: 'not found',
        });

        ssmClient.on(GetParameterCommand).rejectsOnce(notFoundErr);

        await repository.get(mockClientId);

        expect(cache.set).toHaveBeenCalledWith(mockKey, null);

        cache.get.mockReturnValueOnce(null);

        const refetched = await repository.get(mockClientId);

        expect(refetched).toEqual({ data: null });
      });

      it('should not cache when parsing fails', async () => {
        const {
          mocks: { ssmClient, cache },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache
        );

        cache.get.mockReturnValue(undefined);

        const mockSSMResponse = {
          Parameter: { Value: 'invalid-json' },
        };

        ssmClient.on(GetParameterCommand).resolvesOnce(mockSSMResponse);

        await repository.get(mockClientId);

        expect(cache.set).not.toHaveBeenCalled();
      });
    });

    describe('multiple calls with same client ID', () => {
      it('should use cache on subsequent calls', async () => {
        const {
          mocks: { ssmClient, cache },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache
        );

        cache.get
          .mockReturnValueOnce(undefined)
          .mockReturnValueOnce(validClient);

        ssmClient.on(GetParameterCommand).resolvesOnce({
          Parameter: { Value: JSON.stringify(validClient) },
        });

        const result1 = await repository.get(mockClientId);
        const result2 = await repository.get(mockClientId);

        expect(result1).toEqual({ data: validClient });
        expect(result2).toEqual({ data: validClient });
        expect(ssmClient.calls()).toHaveLength(1);
        expect(cache.get).toHaveBeenCalledTimes(2);
      });
    });
  });
});

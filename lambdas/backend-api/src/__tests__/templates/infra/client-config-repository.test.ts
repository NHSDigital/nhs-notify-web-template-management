import { ClientConfigRepository } from '@backend-api/templates/infra/client-config-repository';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
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
  campaignId: 'campaign-123',
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
          mocks: { ssmClient, cache, logger },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache,
          logger
        );

        const mockSSMResponse = {
          Parameter: {
            Value: JSON.stringify(validClient),
          },
        };

        ssmClient.on(GetParameterCommand).resolvesOnce(mockSSMResponse);

        const result = await repository.get(mockClientId);

        expect(cache.set).toHaveBeenCalledWith(mockKey, validClient);

        expect(result).toEqual(validClient);
      });

      it('should handle client config without campaignId', async () => {
        const {
          mocks: { ssmClient, cache, logger },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache,
          logger
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

        expect(result).toEqual(clientWithoutCampaign);
        expect(cache.set).toHaveBeenCalledWith(mockKey, clientWithoutCampaign);
      });

      it('should parse JSON string from SSM parameter value', async () => {
        const {
          mocks: { ssmClient, cache, logger },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache,
          logger
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
          campaignId: 'test',
          features: { proofing: true },
        });
      });

      it('should return undefined when SSM parameter value is invalid JSON', async () => {
        const {
          mocks: { ssmClient, cache, logger },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache,
          logger
        );

        const mockSSMResponse = {
          Parameter: {
            Value: 'invalid-json-string',
          },
        };

        ssmClient.on(GetParameterCommand).resolvesOnce(mockSSMResponse);

        const result = await repository.get(mockClientId);

        expect(result).toBeUndefined();

        expect(cache.set).not.toHaveBeenCalled();
      });

      it('should return undefined when SSM parameter value fails schema validation', async () => {
        const {
          mocks: { ssmClient, cache, logger },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache,
          logger
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

        expect(result).toBeUndefined();

        expect(cache.set).not.toHaveBeenCalled();
      });

      it('should return undefined when SSM parameter value is missing required fields', async () => {
        const {
          mocks: { ssmClient, cache, logger },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache,
          logger
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

        expect(result).toBeUndefined();
      });

      it('should return undefined when SSM parameter has no value', async () => {
        const {
          mocks: { ssmClient, cache, logger },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache,
          logger
        );

        const mockSSMResponse = {
          Parameter: {},
        };

        ssmClient.on(GetParameterCommand).resolvesOnce(mockSSMResponse);

        const result = await repository.get(mockClientId);

        expect(result).toBeUndefined();
      });

      it('should return undefined when SSM response has no parameter', async () => {
        const {
          mocks: { ssmClient, cache, logger },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache,
          logger
        );

        ssmClient.on(GetParameterCommand).resolvesOnce({});

        const result = await repository.get(mockClientId);

        expect(result).toBeUndefined();
      });

      it('should return undefined SSM client errors', async () => {
        const {
          mocks: { ssmClient, cache, logger },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache,
          logger
        );

        const ssmError = new Error('SSM service unavailable');

        ssmClient.on(GetParameterCommand).rejectsOnce(ssmError);

        const client = await repository.get(mockClientId);

        expect(client).toBeUndefined();
      });
    });

    describe('caching behavior', () => {
      it('should cache successfully parsed client config', async () => {
        const {
          mocks: { ssmClient, cache, logger },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache,
          logger
        );

        cache.get.mockReturnValue(undefined);

        const mockSSMResponse = {
          Parameter: { Value: JSON.stringify(validClient) },
        };

        ssmClient.on(GetParameterCommand).resolvesOnce(mockSSMResponse);

        await repository.get(mockClientId);

        expect(cache.set).toHaveBeenCalledWith(mockKey, validClient);
      });

      it('should not cache when parsing fails', async () => {
        const {
          mocks: { ssmClient, cache, logger },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache,
          logger
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
          mocks: { ssmClient, cache, logger },
        } = setup();

        const repository = new ClientConfigRepository(
          mockSSMKeyPrefix,
          ssmClient as unknown as SSMClient,
          cache,
          logger
        );

        cache.get
          .mockReturnValueOnce(undefined)
          .mockReturnValueOnce(validClient);

        ssmClient.on(GetParameterCommand).resolvesOnce({
          Parameter: { Value: JSON.stringify(validClient) },
        });

        const result1 = await repository.get(mockClientId);
        const result2 = await repository.get(mockClientId);

        expect(result1).toEqual(validClient);
        expect(result2).toEqual(validClient);
        expect(ssmClient.calls()).toHaveLength(1);
        expect(cache.get).toHaveBeenCalledTimes(2);
      });
    });
  });
});

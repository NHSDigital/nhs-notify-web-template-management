import { mock } from 'jest-mock-extended';
import type { RoutingConfigRepository } from '@backend-api/templates/infra/routing-config-repository';
import { RoutingConfigClient } from '@backend-api/templates/app/routing-config-client';
import { routingConfig } from '../fixtures/routing-config';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';

const user = { userId: 'userid', clientId: 'nhs-notify-client-id' };

function setup() {
  const repo = mock<RoutingConfigRepository>();
  const { logger } = createMockLogger();

  const mocks = {
    routingConfigRepository: repo,
    logger,
  };

  const client = new RoutingConfigClient(repo, logger);

  return { client, mocks };
}

describe('RoutingConfigClient', () => {
  describe('getRoutingConfig', () => {
    test('returns the routing config from the repository', async () => {
      const { client, mocks } = setup();

      mocks.routingConfigRepository.get.mockResolvedValueOnce({
        data: routingConfig,
      });

      const result = await client.getRoutingConfig(
        '3690d344-731f-4f60-9047-2c63c96623a2',
        user
      );

      expect(result).toEqual({
        data: routingConfig,
      });

      expect(mocks.routingConfigRepository.get).toHaveBeenCalledWith(
        '3690d344-731f-4f60-9047-2c63c96623a2',
        user
      );
    });

    test('returns failures from the repository', async () => {
      const { client, mocks } = setup();

      mocks.routingConfigRepository.get.mockResolvedValueOnce({
        error: {
          errorMeta: { code: 500, description: 'Something went wrong' },
        },
      });

      const result = await client.getRoutingConfig(
        '3690d344-731f-4f60-9047-2c63c96623a2',
        user
      );

      expect(result).toEqual({
        error: {
          errorMeta: { code: 500, description: 'Something went wrong' },
        },
      });

      expect(mocks.routingConfigRepository.get).toHaveBeenCalledWith(
        '3690d344-731f-4f60-9047-2c63c96623a2',
        user
      );
    });

    test('returns not found error when the returned routing config has deleted status', async () => {
      const { client, mocks } = setup();

      mocks.routingConfigRepository.get.mockResolvedValueOnce({
        data: { ...routingConfig, status: 'DELETED' },
      });

      const result = await client.getRoutingConfig(
        '3690d344-731f-4f60-9047-2c63c96623a2',
        user
      );

      expect(result).toEqual({
        error: {
          errorMeta: { code: 404, description: 'Routing Config not found' },
        },
      });

      expect(mocks.routingConfigRepository.get).toHaveBeenCalledWith(
        '3690d344-731f-4f60-9047-2c63c96623a2',
        user
      );
    });
  });
});

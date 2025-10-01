import { mock } from 'jest-mock-extended';
import type { RoutingConfigRepository } from '@backend-api/templates/infra/routing-config-repository';
import { RoutingConfigClient } from '@backend-api/templates/app/routing-config-client';
import { routingConfig } from '../fixtures/routing-config';
import { createMockLogger } from 'nhs-notify-web-template-management-test-helper-utils/mock-logger';
import {
  CreateUpdateRoutingConfig,
  RoutingConfig,
} from 'nhs-notify-backend-client';

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

  describe('createRoutingConfig', () => {
    test('returns created routing config', async () => {
      const { client, mocks } = setup();

      const date = new Date();

      const input: CreateUpdateRoutingConfig = {
        name: 'rc',
        campaignId: 'campaign',
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'SMS',
            channelType: 'primary',
            defaultTemplateId: 'sms',
          },
        ],
        cascadeGroupOverrides: [{ name: 'standard' }],
      };

      const rc: RoutingConfig = {
        ...input,
        clientId: user.clientId,
        createdAt: date.toISOString(),
        id: 'id',
        status: 'DRAFT',
        updatedAt: date.toISOString(),
      };

      mocks.routingConfigRepository.create.mockResolvedValueOnce({
        data: rc,
      });

      const result = await client.createRoutingConfig(input, user);

      expect(mocks.routingConfigRepository.create).toHaveBeenCalledWith(
        input,
        user
      );

      expect(result).toEqual({
        data: rc,
      });
    });

    test('returns 400 error when input is invalid', async () => {
      const { client, mocks } = setup();

      const result = await client.createRoutingConfig(
        { a: 1 } as unknown as CreateUpdateRoutingConfig,
        user
      );

      expect(mocks.routingConfigRepository.create).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          actualError: {
            fieldErrors: {
              campaignId: [
                'Invalid input: expected string, received undefined',
              ],
              cascade: ['Invalid input: expected array, received undefined'],
              cascadeGroupOverrides: [
                'Invalid input: expected array, received undefined',
              ],
              name: ['Invalid input: expected string, received undefined'],
            },
            formErrors: [],
          },
          errorMeta: {
            code: 400,
            description: 'Request failed validation',
            details: {
              campaignId: 'Invalid input: expected string, received undefined',
              cascade: 'Invalid input: expected array, received undefined',
              cascadeGroupOverrides:
                'Invalid input: expected array, received undefined',
              name: 'Invalid input: expected string, received undefined',
            },
          },
        },
      });
    });

    test('returns failures from the repository', async () => {
      const { client, mocks } = setup();

      const input: CreateUpdateRoutingConfig = {
        name: 'rc',
        campaignId: 'campaign',
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'SMS',
            channelType: 'primary',
            defaultTemplateId: 'sms',
          },
        ],
        cascadeGroupOverrides: [{ name: 'standard' }],
      };

      mocks.routingConfigRepository.create.mockResolvedValueOnce({
        error: { errorMeta: { code: 500, description: 'ddb err' } },
      });

      const result = await client.createRoutingConfig(input, user);

      expect(mocks.routingConfigRepository.create).toHaveBeenCalledWith(
        input,
        user
      );

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'ddb err',
          },
        },
      });
    });
  });
});

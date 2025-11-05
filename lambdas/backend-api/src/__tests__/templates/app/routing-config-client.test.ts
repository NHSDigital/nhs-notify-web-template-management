import { mock } from 'jest-mock-extended';
import type { RoutingConfigRepository } from '@backend-api/templates/infra/routing-config-repository';
import { RoutingConfigQuery } from '@backend-api/templates/infra/routing-config-repository/query';
import { RoutingConfigClient } from '@backend-api/templates/app/routing-config-client';
import { routingConfig } from '../fixtures/routing-config';
import {
  CascadeItem,
  CreateRoutingConfig,
  RoutingConfig,
  UpdateRoutingConfig,
} from 'nhs-notify-backend-client';
import { ClientConfigRepository } from '@backend-api/templates/infra/client-config-repository';

const user = { userId: 'userid', clientId: 'nhs-notify-client-id' };

function setup() {
  const routingConfigRepository = mock<RoutingConfigRepository>();

  const clientConfigRepository = mock<ClientConfigRepository>();

  const mocks = {
    routingConfigRepository,
    clientConfigRepository,
  };

  const client = new RoutingConfigClient(
    routingConfigRepository,
    clientConfigRepository
  );

  return { client, mocks };
}

function mockQuery() {
  return mock<RoutingConfigQuery>({
    status: jest.fn().mockReturnThis(),
    excludeStatus: jest.fn().mockReturnThis(),
  });
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
        user.clientId
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
        user.clientId
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
        user.clientId
      );
    });
  });

  describe('listRoutingConfigs', () => {
    it('queries for non-deleted configs with the given owner and returns the resulting list', async () => {
      const { mocks, client } = setup();

      const query = mockQuery();

      mocks.routingConfigRepository.query.mockReturnValueOnce(query);

      query.list.mockResolvedValueOnce({ data: [routingConfig] });

      const result = await client.listRoutingConfigs(user);

      expect(result).toEqual({ data: [routingConfig] });

      expect(mocks.routingConfigRepository.query).toHaveBeenCalledWith(
        'nhs-notify-client-id'
      );
      expect(query.excludeStatus).toHaveBeenCalledWith('DELETED');
      expect(query.status).not.toHaveBeenCalled();
    });

    it('validates status filter parameter', async () => {
      const { client, mocks } = setup();

      const result = await client.listRoutingConfigs(user, {
        status: 'INVALID',
      });

      expect(result).toEqual({
        error: expect.objectContaining({
          errorMeta: {
            code: 400,
            description: 'Request failed validation',
            details: {
              status: 'Invalid option: expected one of "COMPLETED"|"DRAFT"',
            },
          },
        }),
      });

      expect(mocks.routingConfigRepository.query).not.toHaveBeenCalled();
    });

    it('uses the given status filter', async () => {
      const { client, mocks } = setup();

      const query = mockQuery();

      mocks.routingConfigRepository.query.mockReturnValueOnce(query);

      query.list.mockResolvedValueOnce({ data: [routingConfig] });

      const result = await client.listRoutingConfigs(user, {
        status: 'DRAFT',
      });

      expect(result).toEqual({ data: [routingConfig] });

      expect(mocks.routingConfigRepository.query).toHaveBeenCalledWith(
        'nhs-notify-client-id'
      );
      expect(query.excludeStatus).toHaveBeenCalledWith('DELETED');
      expect(query.status).toHaveBeenCalledWith('DRAFT');
    });
  });

  describe('countRoutingConfigs', () => {
    it('queries for non-deleted configs with the given owner and returns the count', async () => {
      const { mocks, client } = setup();

      const query = mockQuery();

      mocks.routingConfigRepository.query.mockReturnValueOnce(query);

      query.count.mockResolvedValueOnce({ data: { count: 3 } });

      const result = await client.countRoutingConfigs(user);

      expect(result).toEqual({ data: { count: 3 } });

      expect(mocks.routingConfigRepository.query).toHaveBeenCalledWith(
        user.clientId
      );
      expect(query.excludeStatus).toHaveBeenCalledWith('DELETED');
      expect(query.status).not.toHaveBeenCalled();
    });

    it('validates status filter parameter', async () => {
      const { client, mocks } = setup();

      const result = await client.countRoutingConfigs(user, {
        status: 'INVALID',
      });

      expect(result).toEqual({
        error: expect.objectContaining({
          errorMeta: {
            code: 400,
            description: 'Request failed validation',
            details: {
              status: 'Invalid option: expected one of "COMPLETED"|"DRAFT"',
            },
          },
        }),
      });

      expect(mocks.routingConfigRepository.query).not.toHaveBeenCalled();
    });

    it('uses the given status filter', async () => {
      const { client, mocks } = setup();

      const query = mockQuery();

      mocks.routingConfigRepository.query.mockReturnValueOnce(query);

      query.count.mockResolvedValueOnce({ data: { count: 18 } });

      const result = await client.countRoutingConfigs(user, {
        status: 'DRAFT',
      });

      expect(result).toEqual({ data: { count: 18 } });

      expect(mocks.routingConfigRepository.query).toHaveBeenCalledWith(
        user.clientId
      );
      expect(query.excludeStatus).toHaveBeenCalledWith('DELETED');
      expect(query.status).toHaveBeenCalledWith('DRAFT');
    });
  });

  describe('createRoutingConfig', () => {
    test('returns created routing config', async () => {
      const { client, mocks } = setup();

      const date = new Date();
      const campaignId = 'campaign';

      const input: CreateRoutingConfig = {
        name: 'rc',
        campaignId,
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

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { routing: true }, campaignIds: [campaignId] },
      });

      mocks.routingConfigRepository.create.mockResolvedValueOnce({
        data: rc,
      });

      const result = await client.createRoutingConfig(input, user);

      expect(mocks.clientConfigRepository.get).toHaveBeenCalledWith(
        user.clientId
      );

      expect(mocks.routingConfigRepository.create).toHaveBeenCalledWith(
        input,
        user
      );

      expect(result).toEqual({
        data: rc,
      });
    });

    test('returns validation error when input is invalid', async () => {
      const { client, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          features: { routing: true },
          campaignIds: [routingConfig.campaignId],
        },
      });

      const result = await client.createRoutingConfig(
        { a: 1 } as unknown as CreateRoutingConfig,
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

      const input: CreateRoutingConfig = {
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

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { routing: true }, campaignIds: ['campaign'] },
      });

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

    test('returns failures from client config repository', async () => {
      const { client, mocks } = setup();

      const input: CreateRoutingConfig = {
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

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 500,
            description: 'could not fetch client config',
          },
        },
      });

      const result = await client.createRoutingConfig(input, user);

      expect(mocks.routingConfigRepository.create).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'could not fetch client config',
          },
        },
      });
    });

    test('returns failure if routing feature is disabled for the client', async () => {
      const { client, mocks } = setup();

      const input: CreateRoutingConfig = {
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

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { routing: false }, campaignIds: ['campaign'] },
      });

      const result = await client.createRoutingConfig(input, user);

      expect(mocks.routingConfigRepository.create).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 400,
            description: 'Routing feature is disabled',
          },
        },
      });
    });

    test('returns failure if campaignId is not allowed for the client', async () => {
      const { client, mocks } = setup();

      const input: CreateRoutingConfig = {
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

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          features: { routing: true },
          campaignIds: ['another campaign'],
        },
      });

      const result = await client.createRoutingConfig(input, user);

      expect(mocks.routingConfigRepository.create).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 400,
            description: 'Invalid campaign ID in request',
          },
        },
      });
    });
  });

  describe('submitRoutingConfig', () => {
    test('returns completed routing config', async () => {
      const { client, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { routing: true } },
      });

      const id = '2cb1c52d-befa-42f4-8628-06cfe63aa64d';

      const completed: RoutingConfig = {
        ...routingConfig,
        status: 'COMPLETED',
      };

      mocks.routingConfigRepository.submit.mockResolvedValueOnce({
        data: completed,
      });

      const result = await client.submitRoutingConfig(id, user);

      expect(mocks.routingConfigRepository.submit).toHaveBeenCalledWith(
        id,
        user
      );

      expect(result).toEqual({
        data: completed,
      });
    });

    test('returns failures from client config repository', async () => {
      const { client, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 500,
            description: 'could not fetch client config',
          },
        },
      });

      const result = await client.submitRoutingConfig('some-id', user);

      expect(mocks.routingConfigRepository.submit).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'could not fetch client config',
          },
        },
      });
    });

    test('returns failure if routing feature is disabled for the client', async () => {
      const { client, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { routing: false } },
      });

      const result = await client.submitRoutingConfig('some-id', user);

      expect(mocks.routingConfigRepository.submit).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 400,
            description: 'Routing feature is disabled',
          },
        },
      });
    });
  });

  describe('deleteRoutingConfig', () => {
    test('returns undefined after deleting routing config', async () => {
      const { client, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { routing: true } },
      });

      const id = '2cb1c52d-befa-42f4-8628-06cfe63aa64d';

      const deleted: RoutingConfig = {
        ...routingConfig,
        status: 'DELETED',
      };

      mocks.routingConfigRepository.delete.mockResolvedValueOnce({
        data: deleted,
      });

      const result = await client.deleteRoutingConfig(id, user);

      expect(mocks.routingConfigRepository.delete).toHaveBeenCalledWith(
        id,
        user
      );

      expect(result).toEqual({
        data: undefined,
      });
    });

    test('returns error response from repository', async () => {
      const { client, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { routing: true } },
      });

      const id = '2cb1c52d-befa-42f4-8628-06cfe63aa64d';

      const errorResponse = {
        error: { errorMeta: { code: 500, description: 'db err' } },
      };

      mocks.routingConfigRepository.delete.mockResolvedValueOnce(errorResponse);

      const result = await client.deleteRoutingConfig(id, user);

      expect(mocks.routingConfigRepository.delete).toHaveBeenCalledWith(
        id,
        user
      );

      expect(result).toEqual(errorResponse);
    });

    test('returns failures from client config repository', async () => {
      const { client, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 500,
            description: 'could not fetch client config',
          },
        },
      });

      const result = await client.deleteRoutingConfig('some-id', user);

      expect(mocks.routingConfigRepository.delete).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'could not fetch client config',
          },
        },
      });
    });

    test('returns failure if routing feature is disabled for the client', async () => {
      const { client, mocks } = setup();

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: { features: { routing: false }, campaignIds: ['campaign'] },
      });

      const result = await client.deleteRoutingConfig('some-id', user);

      expect(mocks.routingConfigRepository.delete).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 400,
            description: 'Routing feature is disabled',
          },
        },
      });
    });
  });

  describe('updateRoutingConfig', () => {
    test('returns updated routing config', async () => {
      const { client, mocks } = setup();

      const update: UpdateRoutingConfig = {
        campaignId: routingConfig.campaignId,
        cascade: routingConfig.cascade,
        cascadeGroupOverrides: routingConfig.cascadeGroupOverrides,
        name: 'new name',
      };

      const updated: RoutingConfig = {
        ...routingConfig,
        ...update,
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          features: { routing: true },
          campaignIds: [routingConfig.campaignId],
        },
      });

      mocks.routingConfigRepository.update.mockResolvedValueOnce({
        data: updated,
      });

      const result = await client.updateRoutingConfig(
        routingConfig.id,
        update,
        user
      );

      expect(mocks.routingConfigRepository.update).toHaveBeenCalledWith(
        routingConfig.id,
        update,
        user
      );

      expect(result).toEqual({
        data: updated,
      });
    });

    test('returns validation error when update is invalid', async () => {
      const { client, mocks } = setup();
      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          features: { routing: true },
          campaignIds: [routingConfig.campaignId],
        },
      });

      const update: UpdateRoutingConfig = {
        campaignId: routingConfig.campaignId,
        cascade: {} as CascadeItem[],
        cascadeGroupOverrides: routingConfig.cascadeGroupOverrides,
        name: routingConfig.name,
      };

      const result = await client.updateRoutingConfig(
        routingConfig.id,
        update,
        user
      );

      expect(mocks.routingConfigRepository.update).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          actualError: {
            fieldErrors: {
              cascade: ['Invalid input: expected array, received object'],
            },
            formErrors: [],
          },
          errorMeta: {
            code: 400,
            description: 'Request failed validation',
            details: {
              cascade: 'Invalid input: expected array, received object',
            },
          },
        },
      });
    });

    test('returns failures from client config repository', async () => {
      const { client, mocks } = setup();

      const update: UpdateRoutingConfig = {
        campaignId: routingConfig.campaignId,
        cascade: routingConfig.cascade,
        cascadeGroupOverrides: routingConfig.cascadeGroupOverrides,
        name: 'new name',
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        error: {
          errorMeta: {
            code: 500,
            description: 'could not fetch client config',
          },
        },
      });

      const result = await client.updateRoutingConfig(
        routingConfig.id,
        update,
        user
      );

      expect(mocks.routingConfigRepository.update).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 500,
            description: 'could not fetch client config',
          },
        },
      });
    });

    test('returns failure if routing feature is disabled for the client', async () => {
      const { client, mocks } = setup();

      const update: UpdateRoutingConfig = {
        cascade: routingConfig.cascade,
        cascadeGroupOverrides: routingConfig.cascadeGroupOverrides,
        name: routingConfig.name,
        campaignId: 'this campaign',
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          features: { routing: false },
          campaignIds: ['this campaign'],
        },
      });

      const result = await client.updateRoutingConfig(
        routingConfig.id,
        update,
        user
      );

      expect(mocks.routingConfigRepository.update).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 400,
            description: 'Routing feature is disabled',
          },
        },
      });
    });

    test('returns failure if campaignId is not allowed for the client', async () => {
      const { client, mocks } = setup();

      const update: UpdateRoutingConfig = {
        cascade: routingConfig.cascade,
        cascadeGroupOverrides: routingConfig.cascadeGroupOverrides,
        name: routingConfig.name,
        campaignId: 'this campaign',
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          features: { routing: true },
          campaignIds: ['another campaign'],
        },
      });

      const result = await client.updateRoutingConfig(
        routingConfig.id,
        update,
        user
      );

      expect(mocks.routingConfigRepository.update).not.toHaveBeenCalled();

      expect(result).toEqual({
        error: {
          errorMeta: {
            code: 400,
            description: 'Invalid campaign ID in request',
          },
        },
      });
    });

    test('allows payloads with no campaign id', async () => {
      const { client, mocks } = setup();

      const update: UpdateRoutingConfig = {
        cascade: routingConfig.cascade,
        cascadeGroupOverrides: routingConfig.cascadeGroupOverrides,
        name: routingConfig.name,
      };

      mocks.clientConfigRepository.get.mockResolvedValueOnce({
        data: {
          features: { routing: true },
          campaignIds: ['another campaign'],
        },
      });

      const updated: RoutingConfig = {
        ...routingConfig,
        ...update,
      };

      mocks.routingConfigRepository.update.mockResolvedValueOnce({
        data: updated,
      });

      const result = await client.updateRoutingConfig(
        routingConfig.id,
        update,
        user
      );

      expect(mocks.routingConfigRepository.update).toHaveBeenCalledWith(
        routingConfig.id,
        update,
        user
      );

      expect(result).toEqual({
        data: updated,
      });
    });
  });
});

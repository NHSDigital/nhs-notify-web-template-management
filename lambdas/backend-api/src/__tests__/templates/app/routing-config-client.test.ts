import { mock } from 'jest-mock-extended';
import type { RoutingConfigRepository } from '@backend-api/templates/infra/routing-config-repository';
import { RoutingConfigQuery } from '@backend-api/templates/infra/routing-config-repository/query';
import { RoutingConfigClient } from '@backend-api/templates/app/routing-config-client';
import { routingConfig } from '../fixtures/routing-config';

function setup() {
  const repo = mock<RoutingConfigRepository>();
  const mocks = { routingConfigRepository: repo };

  const client = new RoutingConfigClient(repo);

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
        'nhs-notify-client-id'
      );

      expect(result).toEqual({
        data: routingConfig,
      });

      expect(mocks.routingConfigRepository.get).toHaveBeenCalledWith(
        '3690d344-731f-4f60-9047-2c63c96623a2',
        'nhs-notify-client-id'
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
        'nhs-notify-client-id'
      );

      expect(result).toEqual({
        error: {
          errorMeta: { code: 500, description: 'Something went wrong' },
        },
      });

      expect(mocks.routingConfigRepository.get).toHaveBeenCalledWith(
        '3690d344-731f-4f60-9047-2c63c96623a2',
        'nhs-notify-client-id'
      );
    });

    test('returns not found error when the returned routing config has deleted status', async () => {
      const { client, mocks } = setup();

      mocks.routingConfigRepository.get.mockResolvedValueOnce({
        data: { ...routingConfig, status: 'DELETED' },
      });

      const result = await client.getRoutingConfig(
        '3690d344-731f-4f60-9047-2c63c96623a2',
        'nhs-notify-client-id'
      );

      expect(result).toEqual({
        error: {
          errorMeta: { code: 404, description: 'Routing Config not found' },
        },
      });

      expect(mocks.routingConfigRepository.get).toHaveBeenCalledWith(
        '3690d344-731f-4f60-9047-2c63c96623a2',
        'nhs-notify-client-id'
      );
    });
  });

  describe('listRoutingConfigs', () => {
    it('queries for non-deleted configs with the given owner and returns the resulting list', async () => {
      const { mocks, client } = setup();

      const query = mockQuery();

      mocks.routingConfigRepository.query.mockReturnValueOnce(query);

      query.list.mockResolvedValueOnce({ data: [routingConfig] });

      const result = await client.listRoutingConfigs('nhs-notify-client-id');

      expect(result).toEqual({ data: [routingConfig] });

      expect(mocks.routingConfigRepository.query).toHaveBeenCalledWith(
        'nhs-notify-client-id'
      );
      expect(query.excludeStatus).toHaveBeenCalledWith('DELETED');
      expect(query.status).not.toHaveBeenCalled();
    });

    it('validates status filter parameter', async () => {
      const { client, mocks } = setup();

      const result = await client.listRoutingConfigs('nhs-notify-client-id', {
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

      const result = await client.listRoutingConfigs('nhs-notify-client-id', {
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

      const result = await client.countRoutingConfigs('nhs-notify-client-id');

      expect(result).toEqual({ data: { count: 3 } });

      expect(mocks.routingConfigRepository.query).toHaveBeenCalledWith(
        'nhs-notify-client-id'
      );
      expect(query.excludeStatus).toHaveBeenCalledWith('DELETED');
      expect(query.status).not.toHaveBeenCalled();
    });

    it('validates status filter parameter', async () => {
      const { client, mocks } = setup();

      const result = await client.countRoutingConfigs('nhs-notify-client-id', {
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

      const result = await client.countRoutingConfigs('nhs-notify-client-id', {
        status: 'DRAFT',
      });

      expect(result).toEqual({ data: { count: 18 } });

      expect(mocks.routingConfigRepository.query).toHaveBeenCalledWith(
        'nhs-notify-client-id'
      );
      expect(query.excludeStatus).toHaveBeenCalledWith('DELETED');
      expect(query.status).toHaveBeenCalledWith('DRAFT');
    });
  });
});

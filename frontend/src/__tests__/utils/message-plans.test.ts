/**
 * @jest-environment node
 */
import { getSessionServer } from '@utils/amplify-utils';
import { countRoutingConfigs, getRoutingConfigs } from '@utils/message-plans';
import { RoutingConfig } from 'nhs-notify-backend-client';
import { routingConfigurationApiClient } from 'nhs-notify-backend-client/src/routing-config-api-client';

const authIdTokenServerMock = jest.mocked(getSessionServer);
const routingConfigurationApiClientMock = jest.mocked(
  routingConfigurationApiClient
);

jest.mock('@utils/amplify-utils');
jest.mock('nhs-notify-backend-client/src/template-api-client');
jest.mock('nhs-notify-backend-client/src/routing-config-api-client');

describe('Message plans actions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    authIdTokenServerMock.mockResolvedValueOnce({
      accessToken: 'token',
      clientId: 'client1',
    });
  });

  describe('getRoutingConfigs', () => {
    test('should throw error when no token', async () => {
      authIdTokenServerMock.mockReset();
      authIdTokenServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(getRoutingConfigs()).rejects.toThrow(
        'Failed to get access token'
      );
    });

    test('should return empty array when calling the API fails', async () => {
      routingConfigurationApiClientMock.list.mockResolvedValueOnce({
        error: {
          errorMeta: { code: 400, description: 'Bad request' },
        },
      });

      const response = await getRoutingConfigs();

      expect(response.length).toBe(0);
    });

    test('should return a list of routing configs - order by createdAt and then id', async () => {
      const fields = {
        status: 'DRAFT',
        name: 'Routing config',
        updatedAt: '2021-01-01T00:00:00.000Z',
        campaignId: 'campaignId',
        clientId: 'clientId',
        cascade: [
          {
            channel: 'EMAIL',
            channelType: 'primary',
            defaultTemplateId: 'id',
            cascadeGroups: ['standard'],
          },
        ],
        cascadeGroupOverrides: [{ name: 'standard' }],
      } satisfies Omit<RoutingConfig, 'id' | 'createdAt'>;

      const routingConfigs = [
        {
          ...fields,
          id: 'a487ed49-e2f7-4871-ac8d-0c6c682c71f5',
          createdAt: '2022-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '8f5157fe-72d7-4a9c-818f-77c128ec8197',
          createdAt: '2020-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '9be9d25f-81d8-422a-a85c-2fa9019cde1e',
          createdAt: '2021-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '1cfdd62d-9eca-4f15-9772-1937d4524c37',
          createdAt: '2021-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '18da6158-07ef-455c-9c31-1a4d78a133cf',
          createdAt: '2021-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '87fb5cbf-708d-49c3-9360-3e37efdc5278',
          createdAt: '2021-01-01T00:00:00.000Z',
        },
        {
          ...fields,
          id: '0d6408fd-57ea-42f2-aae1-ed9614b67068',
          createdAt: '2021-01-01T00:00:00.000Z',
        },
      ];

      // a48... is the newest, 8f5... is the oldest.
      // the others all have the same createdAt.
      const expectedOrder = [
        'a487ed49-e2f7-4871-ac8d-0c6c682c71f5',
        '0d6408fd-57ea-42f2-aae1-ed9614b67068',
        '18da6158-07ef-455c-9c31-1a4d78a133cf',
        '1cfdd62d-9eca-4f15-9772-1937d4524c37',
        '87fb5cbf-708d-49c3-9360-3e37efdc5278',
        '9be9d25f-81d8-422a-a85c-2fa9019cde1e',
        '8f5157fe-72d7-4a9c-818f-77c128ec8197',
      ];

      routingConfigurationApiClientMock.list.mockResolvedValueOnce({
        data: routingConfigs,
      });

      const response = await getRoutingConfigs();

      const actualOrder = [];
      for (const routingConfig of response) {
        actualOrder.push(routingConfig.id);
      }

      expect(actualOrder).toEqual(expectedOrder);
    });

    test('invalid routing configs are not listed', async () => {
      routingConfigurationApiClientMock.list.mockResolvedValueOnce({
        data: [
          {
            status: 'DRAFT',
            name: 'Routing config',
            updatedAt: '2021-01-01T00:00:00.000Z',
            campaignId: 'campaignId',
            clientId: 'clientId',
            cascade: [],
            cascadeGroupOverrides: [{ name: 'standard' }],
            id: 'a487ed49-e2f7-4871-ac8d-0c6c682c71f5',
            createdAt: '2022-01-01T00:00:00.000Z',
          },
        ],
      });

      const response = await getRoutingConfigs();

      expect(response).toEqual([]);
    });
  });

  describe('countRoutingConfigs', () => {
    test('should throw error when no token', async () => {
      authIdTokenServerMock.mockReset();
      authIdTokenServerMock.mockResolvedValueOnce({
        accessToken: undefined,
        clientId: undefined,
      });

      await expect(countRoutingConfigs('DRAFT')).rejects.toThrow(
        'Failed to get access token'
      );
    });

    test('should return 0 when calling the API fails', async () => {
      routingConfigurationApiClientMock.count.mockResolvedValueOnce({
        error: {
          errorMeta: { code: 400, description: 'Bad request' },
        },
      });

      const response = await countRoutingConfigs('DRAFT');

      expect(response).toBe(0);
    });

    test('should return count of routing configurations for status', async () => {
      // Note: we're doing this here because we call `getSessionServer` twice
      // and it's only mocked-out once by default.
      authIdTokenServerMock.mockResolvedValue({
        accessToken: 'token',
        clientId: 'client1',
      });

      routingConfigurationApiClientMock.count
        .mockResolvedValueOnce({
          data: { count: 1 },
        })
        .mockResolvedValueOnce({
          data: { count: 5 },
        });

      const draftCount = await countRoutingConfigs('DRAFT');
      const completedCount = await countRoutingConfigs('COMPLETED');

      expect(draftCount).toEqual(1);
      expect(routingConfigurationApiClientMock.count).toHaveBeenNthCalledWith(
        1,
        'token',
        'DRAFT'
      );
      expect(completedCount).toEqual(5);
      expect(routingConfigurationApiClientMock.count).toHaveBeenNthCalledWith(
        2,
        'token',
        'COMPLETED'
      );
    });
  });
});

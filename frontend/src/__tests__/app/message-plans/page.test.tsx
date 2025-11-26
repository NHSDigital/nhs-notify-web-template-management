/**
 * @jest-environment node
 */
import { getRoutingConfigs, countRoutingConfigs } from '@utils/message-plans';
import {
  type MessagePlansProps,
  MessagePlans,
} from '@molecules/MessagePlans/MessagePlans';
import { serverIsFeatureEnabled } from '@utils/server-features';
import MessagePlansPage, { generateMetadata } from '@app/message-plans/page';
import { ReactElement } from 'react';
import { RoutingConfig } from 'nhs-notify-backend-client';

jest.mock('@utils/message-plans');
jest.mock('@utils/server-features');

const countRoutingConfigsMock = jest.mocked(countRoutingConfigs);
const serverIsFeatureEnabledMock = jest.mocked(serverIsFeatureEnabled);
const getRoutingConfigsMock = jest.mocked(getRoutingConfigs);

const buildRoutingConfig = (rc: Partial<RoutingConfig>): RoutingConfig => ({
  campaignId: 'abc',
  cascade: [],
  cascadeGroupOverrides: [],
  clientId: 'client-a',
  createdAt: '2025-09-09T10:00:00Z',
  defaultCascadeGroup: 'standard',
  status: 'DRAFT',
  id: '',
  name: '',
  updatedAt: '',
  ...rc,
});

describe('MessagePlansPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    serverIsFeatureEnabledMock.mockResolvedValueOnce(true);
  });

  test('page metadata', async () => {
    const metadata = await generateMetadata();

    expect(metadata).toEqual({
      title: 'Message plans - NHS Notify',
    });
  });

  test('renders the page with drafts and production routing plans', async () => {
    getRoutingConfigsMock.mockResolvedValueOnce([
      buildRoutingConfig({
        id: '1',
        name: 'Draft A',
        updatedAt: '2025-09-10T10:00:00Z',
        status: 'DRAFT',
      }),
      buildRoutingConfig({
        id: '2',
        name: 'Prod X',
        updatedAt: '2025-09-09T11:00:00Z',
        status: 'COMPLETED',
      }),
      buildRoutingConfig({
        id: '3',
        name: 'Prod Y',
        updatedAt: '2025-09-08T12:00:00Z',
        status: 'COMPLETED',
      }),
    ]);

    countRoutingConfigsMock.mockResolvedValueOnce(1).mockResolvedValueOnce(2);

    const page = (await MessagePlansPage()) as ReactElement<
      MessagePlansProps,
      typeof MessagePlans
    >;

    expect(getRoutingConfigsMock).toHaveBeenCalledTimes(1);

    expect(countRoutingConfigsMock).toHaveBeenNthCalledWith(1, 'DRAFT');

    expect(countRoutingConfigsMock).toHaveBeenNthCalledWith(2, 'COMPLETED');

    expect(page.props.draft).toEqual({
      plans: [
        {
          id: '1',
          name: 'Draft A',
          lastUpdated: '2025-09-10T10:00:00Z',
          status: 'DRAFT',
        },
      ],
      count: 1,
    });

    expect(page.props.production).toEqual({
      plans: [
        {
          id: '2',
          name: 'Prod X',
          lastUpdated: '2025-09-09T11:00:00Z',
          status: 'COMPLETED',
        },
        {
          id: '3',
          name: 'Prod Y',
          lastUpdated: '2025-09-08T12:00:00Z',
          status: 'COMPLETED',
        },
      ],
      count: 2,
    });
  });
});

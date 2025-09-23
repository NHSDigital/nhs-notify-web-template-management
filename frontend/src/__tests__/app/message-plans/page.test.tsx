/**
 * @jest-environment node
 */
import { getRoutingConfigs } from '@utils/form-actions';
import {
  type MessagePlansProps,
  MessagePlans,
} from '@molecules/MessagePlans/MessagePlans';
import { serverIsFeatureEnabled } from '@utils/server-features';
import MessagePlansPage, { generateMetadata } from '@app/message-plans/page';
import { redirect } from 'next/navigation';
import { ReactElement } from 'react';

jest.mock('next/navigation');
jest.mock('@utils/form-actions');
jest.mock('@utils/server-features');

const serverIsFeatureEnabledMock = jest.mocked(serverIsFeatureEnabled);
const getRoutingConfigsMock = jest.mocked(getRoutingConfigs);
const redirectMock = jest.mocked(redirect);

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

  test('redirects to invalid page when routing feature is disabled', async () => {
    serverIsFeatureEnabledMock.mockReset();
    serverIsFeatureEnabledMock.mockResolvedValueOnce(false);

    await MessagePlansPage();

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test('renders the page with drafts and production routing plans', async () => {
    getRoutingConfigsMock.mockResolvedValueOnce([
      {
        id: '1',
        name: 'Draft A',
        lastUpdated: '2025-09-10T10:00:00Z',
        status: 'DRAFT',
      },
      {
        id: '2',
        name: 'Prod X',
        lastUpdated: '2025-09-09T11:00:00Z',
        status: 'PRODUCTION',
      },
      {
        id: '3',
        name: 'Prod Y',
        lastUpdated: '2025-09-08T12:00:00Z',
        status: 'PRODUCTION',
      },
    ]);

    const page = (await MessagePlansPage()) as ReactElement<
      MessagePlansProps,
      typeof MessagePlans
    >;

    expect(page.props).toBeDefined();

    expect(redirectMock).not.toHaveBeenCalled();

    expect(getRoutingConfigsMock).toHaveBeenCalledTimes(1);

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
          status: 'PRODUCTION',
        },
        {
          id: '3',
          name: 'Prod Y',
          lastUpdated: '2025-09-08T12:00:00Z',
          status: 'PRODUCTION',
        },
      ],
      count: 2,
    });
  });

  test('renders the page with no items', async () => {
    getRoutingConfigsMock.mockResolvedValueOnce([]);

    const page = (await MessagePlansPage()) as ReactElement<
      MessagePlansProps,
      typeof MessagePlans
    >;

    expect(page.props).toBeDefined();

    expect(page.props.draft).toEqual({
      plans: [],
      count: 0,
    });

    expect(page.props.production).toEqual({
      plans: [],
      count: 0,
    });
  });
});

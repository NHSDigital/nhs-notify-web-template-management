import { render } from '@testing-library/react';
import { mock } from 'jest-mock-extended';
import { redirect, RedirectType } from 'next/navigation';
import { RoutingConfig } from 'nhs-notify-web-template-management-types';
import { getRoutingConfig } from '@utils/message-plans';
import Page, {
  metadata,
} from '../../../../app/message-plans/get-ready-to-move/[routingConfigId]/page';

jest.mock('next/navigation');
jest.mock('@utils/message-plans');

const routingConfig = mock<RoutingConfig>({
  name: 'My Routing Config',
});

beforeEach(() => {
  jest.clearAllMocks();
});

test('metadata', () => {
  expect(metadata).toEqual({
    title: 'Get ready to move message plan to production - NHS Notify',
  });
});

test('matches snapshot', async () => {
  jest.mocked(getRoutingConfig).mockResolvedValueOnce(routingConfig);

  const page = await Page({
    params: Promise.resolve({ routingConfigId: 'routing-config-id' }),
  });

  const container = render(page);

  expect(container.asFragment()).toMatchSnapshot();
});

test('redirects if routing config is not found from path parameter', async () => {
  await Page({
    params: Promise.resolve({ routingConfigId: 'routing-config-id' }),
  });

  expect(getRoutingConfig).toHaveBeenCalledWith('routing-config-id');

  expect(redirect).toHaveBeenCalledWith(
    '/message-plans/invalid',
    RedirectType.replace
  );
});

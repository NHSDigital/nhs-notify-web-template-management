import { randomUUID } from 'node:crypto';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import { redirect, RedirectType } from 'next/navigation';
import { RoutingConfig } from 'nhs-notify-backend-client';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import { submitRoutingConfig } from '@utils/message-plans';
import { getRoutingConfig } from '@utils/message-plans';
import Page, {
  metadata,
} from '../../../../app/message-plans/move-to-production/[routingConfigId]/page';

jest.mock('next/navigation');
jest.mock('@utils/csrf-utils');
jest.mock('@utils/message-plans');
jest.mock('@utils/message-plans');
jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);

const routingConfig = mock<RoutingConfig>({
  name: 'My Routing Config',
});

beforeEach(() => {
  jest.clearAllMocks();
});

test('metadata', () => {
  expect(metadata).toEqual({
    title: 'Move message plan to production - NHS Notify',
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

test('redirects if form is submitted with invalid routing config id', async () => {
  jest.mocked(getRoutingConfig).mockResolvedValueOnce(routingConfig);

  const user = await userEvent.setup();

  const page = await Page({
    params: Promise.resolve({ routingConfigId: 'routing-config-id' }),
  });

  render(page);

  await user.click(screen.getByTestId('submit-button'));

  expect(redirect).toHaveBeenCalledWith(
    '/message-plans/invalid',
    RedirectType.push
  );

  expect(submitRoutingConfig).not.toHaveBeenCalled();
});

test('submits the message plan and redirects when form is submitted', async () => {
  const routingConfigId = randomUUID();

  jest.mocked(getRoutingConfig).mockResolvedValueOnce(routingConfig);

  const user = await userEvent.setup();

  const page = await Page({
    params: Promise.resolve({ routingConfigId }),
  });

  render(page);

  await user.click(screen.getByTestId('submit-button'));

  expect(redirect).toHaveBeenCalledWith('/message-plans', RedirectType.push);

  expect(submitRoutingConfig).toHaveBeenCalledWith(routingConfigId);
});

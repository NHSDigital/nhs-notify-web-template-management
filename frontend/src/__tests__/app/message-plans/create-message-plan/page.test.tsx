import { render } from '@testing-library/react';
import { redirect, RedirectType } from 'next/navigation';
import { MESSAGE_ORDER_OPTIONS_LIST } from 'nhs-notify-web-template-management-utils';
import CreateMessagePlanPage from '@app/message-plans/create-message-plan/page';
import { MessagePlanForm } from '@forms/MessagePlan/MessagePlan';
import { fetchClient } from '@utils/server-features';
import { NextRedirectError } from '@testhelpers/next-redirect';

jest.mock('next/navigation');
jest.mock('@forms/MessagePlan/MessagePlan');
jest.mock('@utils/server-features');

beforeEach(() => {
  jest.resetAllMocks();

  jest.mocked(redirect).mockImplementation((url, type) => {
    throw new NextRedirectError(url, type);
  });

  jest
    .mocked(MessagePlanForm)
    .mockImplementation(() => <div data-testid='mocked-message-plan-form' />);

  jest
    .mocked(fetchClient)
    .mockResolvedValue({ campaignIds: ['campaign-1'], features: {} });
});

describe('CreateMessagePlanPage', () => {
  test('redirects when there are no campaignIds', async () => {
    jest.mocked(fetchClient).mockResolvedValueOnce({ features: {} });

    await expect(
      CreateMessagePlanPage({ searchParams: Promise.resolve({}) })
    ).rejects.toMatchObject({
      message: 'NEXT_REDIRECT',
      url: '/message-plans/campaign-id-required',
      type: RedirectType.replace,
    });
  });

  test('redirects when searchParams are missing', async () => {
    await expect(
      CreateMessagePlanPage({ searchParams: Promise.resolve({}) })
    ).rejects.toMatchObject({
      message: 'NEXT_REDIRECT',
      url: '/message-plans/choose-message-order',
      type: RedirectType.replace,
    });
  });

  test('redirects when messageOrder is invalid', async () => {
    await expect(
      CreateMessagePlanPage({
        searchParams: Promise.resolve({ messageOrder: 'invalid' }),
      })
    ).rejects.toMatchObject({
      message: 'NEXT_REDIRECT',
      url: '/message-plans/choose-message-order',
      type: RedirectType.replace,
    });
  });

  test.each(MESSAGE_ORDER_OPTIONS_LIST)(
    'renders the page when messageOrder is "%s"',
    async (messageOrder) => {
      const ui = await CreateMessagePlanPage({
        searchParams: Promise.resolve({ messageOrder }),
      });

      const container = render(ui);

      expect(container.asFragment()).toMatchSnapshot();

      expect(jest.mocked(MessagePlanForm).mock.calls[0][0]).toEqual({
        messageOrder,
        campaignIds: ['campaign-1'],
      });
    }
  );
});

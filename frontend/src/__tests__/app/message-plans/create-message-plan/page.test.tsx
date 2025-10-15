import { render } from '@testing-library/react';
import { redirect, RedirectType } from 'next/navigation';
import { MESSAGE_ORDER_OPTIONS_LIST } from 'nhs-notify-web-template-management-utils';
import CreateMessagePlanPage from '@app/message-plans/create-message-plan/page';
import { createMessagePlanServerAction } from '@app/message-plans/create-message-plan/server-action';
import { MessagePlanForm } from '@forms/MessagePlan/MessagePlan';
import { NHSNotifyFormProvider } from '@providers/form-provider';
import { NextRedirectError } from '@testhelpers/next-redirect';
import { fetchClient } from '@utils/server-features';

jest.mock('next/navigation');
jest.mock('@app/message-plans/create-message-plan/server-action');
jest.mock('@forms/MessagePlan/MessagePlan');
jest.mock('@providers/form-provider');
jest.mock('@utils/server-features');

jest.mocked(redirect).mockImplementation((url, type) => {
  throw new NextRedirectError(url, type);
});

jest
  .mocked(NHSNotifyFormProvider)
  .mockImplementation(({ children }) => (
    <div data-testid='mocked-form-provider'>{children}</div>
  ));

jest
  .mocked(MessagePlanForm)
  .mockImplementation(() => <div data-testid='mocked-message-plan-form' />);

jest
  .mocked(fetchClient)
  .mockResolvedValue({ campaignIds: ['campaign-1'], features: {} });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('CreateMessagePlanPage', () => {
  test('renders the page', async () => {
    const ui = await CreateMessagePlanPage({
      searchParams: Promise.resolve({ messageOrder: 'NHSAPP' }),
    });

    const container = render(ui);

    expect(container.asFragment()).toMatchSnapshot();
  });

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

      render(ui);

      expect(
        jest.mocked(NHSNotifyFormProvider).mock.lastCall?.at(0)
      ).toMatchObject({
        serverAction: jest.mocked(createMessagePlanServerAction),
      });

      expect(jest.mocked(MessagePlanForm).mock.lastCall?.at(0)).toEqual({
        messageOrder,
        campaignIds: ['campaign-1'],
      });
    }
  );
});

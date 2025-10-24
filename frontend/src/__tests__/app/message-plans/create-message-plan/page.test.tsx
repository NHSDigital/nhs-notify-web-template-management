import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { redirect, RedirectType } from 'next/navigation';
import { MESSAGE_ORDER_OPTIONS_LIST } from 'nhs-notify-web-template-management-utils';
import CreateMessagePlanPage from '@app/message-plans/create-message-plan/page';
import { createMessagePlanServerAction } from '@app/message-plans/create-message-plan/server-action';
import { NextRedirectError } from '@testhelpers/next-redirect';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import { fetchClient } from '@utils/server-features';

jest.mock('next/navigation');
jest.mocked(redirect).mockImplementation((url, type) => {
  throw new NextRedirectError(url, type);
});

jest.mock('@app/message-plans/create-message-plan/server-action');

jest.mock('@utils/csrf-utils');
jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);

jest.mock('@utils/server-features');
jest.mocked(fetchClient).mockResolvedValue({
  campaignIds: ['campaign-1', 'campaign-2'],
  features: {},
});

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

  test('on submit it invokes the server action and renders error summary', async () => {
    const user = await userEvent.setup();

    jest.mocked(createMessagePlanServerAction).mockResolvedValue({
      errorState: {
        fieldErrors: {
          name: ['Name Error'],
          campaignId: ['Campaign Id Error'],
        },
      },
    });

    const ui = await CreateMessagePlanPage({
      searchParams: Promise.resolve({ messageOrder: 'NHSAPP' }),
    });

    const container = render(ui);

    await user.click(screen.getByTestId('name-field'));

    await user.keyboard('My Message Plan');

    await user.selectOptions(
      screen.getByTestId('campaign-id-field'),
      'campaign-2'
    );

    await user.click(screen.getByTestId('submit-button'));

    expect(createMessagePlanServerAction).toHaveBeenCalledTimes(1);
    expect(createMessagePlanServerAction).toHaveBeenCalledWith(
      {},
      expect.any(FormData)
    );

    const formData = jest
      .mocked(createMessagePlanServerAction)
      .mock.lastCall?.at(1) as FormData;

    expect(Object.fromEntries(formData.entries())).toMatchObject({
      campaignId: 'campaign-2',
      messageOrder: 'NHSAPP',
      name: 'My Message Plan',
    });

    //  error-summary" test id targets the nested heading rather than the top level of the error summary
    // so we need to assert against the parent element
    await waitFor(async () => {
      const errorSummaryHeading = await screen.getByTestId('error-summary');
      expect(errorSummaryHeading.parentElement).toHaveFocus();
    });

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
      await expect(
        CreateMessagePlanPage({
          searchParams: Promise.resolve({ messageOrder }),
        })
      ).resolves.not.toThrow();
    }
  );
});

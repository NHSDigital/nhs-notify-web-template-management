import { render, screen } from '@testing-library/react';
import { redirect, RedirectType } from 'next/navigation';
import CreateMessagePlanPage, {
  generateMetadata,
} from '@app/message-plans/create-message-plan/page';
import { MessagePlanForm } from '@forms/MessagePlan/MessagePlan';
import { NextRedirectError } from '../../../helpers/next-redirect';
import { MESSAGE_ORDER_OPTIONS_LIST } from 'nhs-notify-web-template-management-utils';

jest.mock('next/navigation');
jest.mock('@forms/MessagePlan/MessagePlan');

beforeEach(() => {
  jest.mocked(redirect).mockImplementation((url, type) => {
    throw new NextRedirectError(url, type);
  });

  jest
    .mocked(MessagePlanForm)
    .mockImplementation(({ messageOrder }: { messageOrder: string }) => (
      <div data-testid='message-plan-form' data-message-order={messageOrder} />
    ));
});

describe('CreateMessagePlanPage', () => {
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

      // assert against mocked form
      expect(screen.getByTestId('message-plan-form')).toHaveAttribute(
        'data-message-order',
        messageOrder
      );
    }
  );
});

describe('generateMetadata', () => {
  test('it returns the page title', async () => {
    await expect(generateMetadata()).resolves.toEqual({
      title: 'Create message plan - NHS Notify',
    });
  });
});

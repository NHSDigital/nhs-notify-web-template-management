import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessagePlanForm } from '@forms/MessagePlan/MessagePlan';
import { useNHSNotifyForm } from '@providers/form-provider';
import { verifyFormCsrfToken } from '@utils/csrf-utils';

jest.mock('@providers/form-provider');
const mockAction = jest.fn();
jest.mocked(useNHSNotifyForm).mockReturnValue([{}, mockAction, false]);

jest.mock('@utils/csrf-utils');
jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);

beforeEach(() => {
  jest.clearAllMocks();
});

test('renders form with single campaign id displayed', () => {
  const container = render(
    <MessagePlanForm
      backLink={{
        href: '/message-plans/choose-message-order',
        text: 'Go back',
      }}
      campaignIds={['campaign-id']}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders form with select for multiple campaign ids', () => {
  const container = render(
    <MessagePlanForm
      backLink={{
        href: '/message-plans/choose-message-order',
        text: 'Go back',
      }}
      campaignIds={['campaign-1', 'campaign-2']}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders form with children', () => {
  const container = render(
    <MessagePlanForm
      backLink={{
        href: '/message-plans/choose-message-order',
        text: 'Go back',
      }}
      campaignIds={['campaign-id']}
    >
      <input type='hidden' name='messagePlanId' value='abc-123' />
    </MessagePlanForm>
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders errors', async () => {
  jest.mocked(useNHSNotifyForm).mockReturnValueOnce([
    {
      errorState: {
        fieldErrors: {
          name: ['Name error'],
          campaignId: ['CampaignId error'],
        },
      },
    },
    jest.fn(),
    false,
  ]);

  const container = render(
    <MessagePlanForm
      backLink={{
        href: '/message-plans/choose-message-order',
        text: 'Go back',
      }}
      campaignIds={['campaign-id', 'campaign-2']}
    />
  );

  expect(container.asFragment()).toMatchSnapshot();
});

test('invokes the action with the form data when the form is submitted - single campaign id', async () => {
  const user = userEvent.setup();

  render(
    <MessagePlanForm
      backLink={{
        href: '/message-plans/choose-message-order',
        text: 'Go back',
      }}
      campaignIds={['campaign-id']}
    >
      <input type='hidden' name='messageOrder' value='NHSAPP' />
    </MessagePlanForm>
  );

  await user.click(screen.getByTestId('name-field'));

  await user.keyboard('My Message Plan');

  await user.click(screen.getByTestId('submit-button'));

  expect(mockAction).toHaveBeenCalledTimes(1);

  expect(mockAction).toHaveBeenLastCalledWith(expect.any(FormData));

  const formData = mockAction.mock.lastCall?.at(0) as FormData;

  expect(Object.fromEntries(formData.entries())).toMatchObject({
    campaignId: 'campaign-id',
    messageOrder: 'NHSAPP',
    name: 'My Message Plan',
  });
});

test('invokes the action with the form data when the form is submitted - multiple campaign id', async () => {
  const user = userEvent.setup();

  render(
    <MessagePlanForm
      backLink={{
        href: '/message-plans/choose-message-order',
        text: 'Go back',
      }}
      campaignIds={['campaign-id', 'campaign-id-2']}
    >
      <input type='hidden' name='messagePlanId' value='abc-123' />
    </MessagePlanForm>
  );

  await user.click(screen.getByTestId('name-field'));

  await user.keyboard('My Message Plan');

  await user.selectOptions(
    screen.getByTestId('campaign-id-field'),
    'campaign-id-2'
  );

  await user.click(screen.getByTestId('submit-button'));

  expect(mockAction).toHaveBeenCalledTimes(1);

  expect(mockAction).toHaveBeenLastCalledWith(expect.any(FormData));

  const formData = mockAction.mock.lastCall?.at(0) as FormData;

  expect(Object.fromEntries(formData.entries())).toMatchObject({
    campaignId: 'campaign-id-2',
    messagePlanId: 'abc-123',
    name: 'My Message Plan',
  });
});

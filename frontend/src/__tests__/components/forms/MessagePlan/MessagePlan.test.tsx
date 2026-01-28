import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MessagePlanForm,
  NHSNotifyFormProvider,
} from '@forms/MessagePlan/MessagePlan';
import { verifyFormCsrfToken } from '@utils/csrf-utils';

jest.mock('@utils/csrf-utils');

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(verifyFormCsrfToken).mockResolvedValue(true);
});

test('renders form with single campaign id displayed', () => {
  const container = render(
    <NHSNotifyFormProvider serverAction={jest.fn()}>
      <MessagePlanForm
        backLink={{
          href: '/message-plans/choose-message-order',
          text: 'Go back',
        }}
        campaignIds={['campaign-id']}
      />
    </NHSNotifyFormProvider>
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders form with select for multiple campaign ids', () => {
  const container = render(
    <NHSNotifyFormProvider serverAction={jest.fn()}>
      <MessagePlanForm
        backLink={{
          href: '/message-plans/choose-message-order',
          text: 'Go back',
        }}
        campaignIds={['campaign-1', 'campaign-2']}
      />
    </NHSNotifyFormProvider>
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders form with children', () => {
  const container = render(
    <NHSNotifyFormProvider serverAction={jest.fn()}>
      <MessagePlanForm
        backLink={{
          href: '/message-plans/choose-message-order',
          text: 'Go back',
        }}
        campaignIds={['campaign-id']}
      >
        <input type='hidden' name='messagePlanId' value='abc-123' />
      </MessagePlanForm>
    </NHSNotifyFormProvider>
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders errors', async () => {
  const user = userEvent.setup();

  const action = jest.fn().mockResolvedValueOnce({
    errorState: {
      fieldErrors: {
        name: ['Name error'],
        campaignId: ['CampaignId error'],
      },
    },
  });

  const container = render(
    <NHSNotifyFormProvider serverAction={action}>
      <MessagePlanForm
        backLink={{
          href: '/message-plans/choose-message-order',
          text: 'Go back',
        }}
        campaignIds={['campaign-id', 'campaign-2']}
      />
    </NHSNotifyFormProvider>
  );

  await user.click(screen.getByRole('button', { name: 'Save and continue' }));

  expect(container.asFragment()).toMatchSnapshot();
});

test('invokes the action with the form data when the form is submitted - single campaign id', async () => {
  const user = userEvent.setup();

  const action = jest.fn().mockResolvedValue({});

  render(
    <NHSNotifyFormProvider serverAction={action}>
      <MessagePlanForm
        backLink={{
          href: '/message-plans/choose-message-order',
          text: 'Go back',
        }}
        campaignIds={['campaign-id']}
      >
        <input type='hidden' name='messageOrder' value='NHSAPP' />
      </MessagePlanForm>
    </NHSNotifyFormProvider>
  );

  await user.click(screen.getByTestId('name-field'));

  await user.keyboard('My Message Plan');

  await user.click(screen.getByTestId('submit-button'));

  expect(action).toHaveBeenCalledTimes(1);

  expect(action).toHaveBeenLastCalledWith(
    expect.any(Object),
    expect.any(FormData)
  );

  const formData = action.mock.lastCall?.at(1) as FormData;

  expect(Object.fromEntries(formData.entries())).toMatchObject({
    campaignId: 'campaign-id',
    messageOrder: 'NHSAPP',
    name: 'My Message Plan',
  });
});

test('invokes the action with the form data when the form is submitted - multiple campaign id', async () => {
  const user = userEvent.setup();

  const action = jest.fn().mockResolvedValue({});

  render(
    <NHSNotifyFormProvider serverAction={action}>
      <MessagePlanForm
        backLink={{
          href: '/message-plans/choose-message-order',
          text: 'Go back',
        }}
        campaignIds={['campaign-id', 'campaign-id-2']}
      >
        <input type='hidden' name='messagePlanId' value='abc-123' />
      </MessagePlanForm>
    </NHSNotifyFormProvider>
  );

  await user.click(screen.getByTestId('name-field'));

  await user.keyboard('My Message Plan');

  await user.selectOptions(
    screen.getByTestId('campaign-id-field'),
    'campaign-id-2'
  );

  await user.click(screen.getByTestId('submit-button'));

  expect(action).toHaveBeenCalledTimes(1);

  expect(action).toHaveBeenLastCalledWith(
    expect.any(Object),
    expect.any(FormData)
  );

  const formData = action.mock.lastCall?.at(1) as FormData;

  expect(Object.fromEntries(formData.entries())).toMatchObject({
    campaignId: 'campaign-id-2',
    messagePlanId: 'abc-123',
    name: 'My Message Plan',
  });
});

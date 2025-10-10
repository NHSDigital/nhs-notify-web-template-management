import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import { redirect, RedirectType } from 'next/navigation';
import {
  CascadeGroup,
  CascadeItem,
  RoutingConfig,
} from 'nhs-notify-backend-client';
import { MessageOrder } from 'nhs-notify-web-template-management-utils';
import { MessagePlanForm } from '@forms/MessagePlan/MessagePlan';
import { verifyFormCsrfToken } from '@utils/csrf-utils';
import { createRoutingConfig } from '@utils/form-actions';
import {
  NextRedirectBoundary,
  NextRedirectError,
} from '../../../helpers/next-redirect';

jest.mock('next/navigation');
jest.mock('@utils/csrf-utils');
jest.mock('@utils/form-actions');

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(verifyFormCsrfToken).mockResolvedValueOnce(true);
  jest.mocked(createRoutingConfig).mockResolvedValueOnce(
    mock<RoutingConfig>({
      id: 'mock-routing-config-id',
    })
  );
  jest.mocked(redirect).mockImplementationOnce((url, type) => {
    // Next redirect return type is `never` because it throws an error
    // Mock this behaviour using custom error and error boundary
    throw new NextRedirectError(url, type);
  });
});

test('renders form with single campaign id displayed', () => {
  const container = render(
    <MessagePlanForm messageOrder='NHSAPP' campaignIds={['campaign-id']} />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders form with select for multiple campaign ids', () => {
  const container = render(
    <MessagePlanForm
      messageOrder='NHSAPP'
      campaignIds={['campaign-1', 'campaign-2']}
    />
  );
  expect(container.asFragment()).toMatchSnapshot();
});

test('renders error if form is submitted with empty name', async () => {
  const user = userEvent.setup();

  const container = render(
    <MessagePlanForm messageOrder='NHSAPP' campaignIds={['campaign-id']} />
  );

  await user.click(screen.getByTestId('submit-button'));

  expect(container.asFragment()).toMatchSnapshot();
});

test('renders error if form is submitted with name too long', async () => {
  const user = userEvent.setup();

  const container = render(
    <MessagePlanForm messageOrder='NHSAPP' campaignIds={['campaign-id']} />
  );

  await user.click(screen.getByTestId('name-field'));

  await user.keyboard('x'.repeat(201));

  await user.click(screen.getByTestId('submit-button'));

  expect(container.asFragment()).toMatchSnapshot();
});

test('renders error if form is submitted with no campaign id selected', async () => {
  const user = userEvent.setup();

  const container = render(
    <MessagePlanForm
      messageOrder='NHSAPP'
      campaignIds={['campaign-1', 'campaign-2']}
    />
  );

  await user.click(screen.getByTestId('name-field'));

  await user.keyboard('My template');

  await user.click(screen.getByTestId('submit-button'));

  expect(container.asFragment()).toMatchSnapshot();
});

test('creates a new routing config with single campaign id and redirects to the choose-templates page', async () => {
  const user = userEvent.setup();

  const container = render(
    <NextRedirectBoundary>
      <MessagePlanForm messageOrder='NHSAPP' campaignIds={['campaign-1']} />
    </NextRedirectBoundary>,
    // @ts-expect-error silence noisy error logging from react error boundary
    { onCaughtError: () => {} }
  );

  await user.click(screen.getByTestId('name-field'));

  await user.keyboard('My Message Plan');

  await user.click(screen.getByTestId('submit-button'));

  expect(createRoutingConfig).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'My Message Plan',
      campaignId: 'campaign-1',
    })
  );

  expect(redirect).toHaveBeenCalledWith(
    '/message-plans/choose-templates/mock-routing-config-id',
    RedirectType.push
  );

  expect(container.asFragment()).toMatchSnapshot();
});

test('creates a new routing config with selected campaign id and redirects to the choose-templates page', async () => {
  const user = userEvent.setup();

  const container = render(
    <NextRedirectBoundary>
      <MessagePlanForm
        messageOrder='NHSAPP'
        campaignIds={['campaign-1', 'campaign-2']}
      />
    </NextRedirectBoundary>,
    // @ts-expect-error silence noisy error logging from react error boundary
    { onCaughtError: () => {} }
  );

  await user.click(screen.getByTestId('name-field'));

  await user.keyboard('My Message Plan');

  await user.selectOptions(
    screen.getByTestId('campaign-id-field'),
    'campaign-2'
  );

  await user.click(screen.getByTestId('submit-button'));

  expect(createRoutingConfig).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'My Message Plan',
      campaignId: 'campaign-2',
    })
  );

  expect(redirect).toHaveBeenCalledWith(
    '/message-plans/choose-templates/mock-routing-config-id',
    RedirectType.push
  );

  expect(container.asFragment()).toMatchSnapshot();
});

const MESSAGE_ORDER_SCENARIOS: [MessageOrder, CascadeItem[], CascadeGroup[]][] =
  [
    [
      'NHSAPP',
      [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: '',
        },
      ],
      [{ name: 'standard' }],
    ],
    [
      'NHSAPP,EMAIL',
      [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: '',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'EMAIL',
          channelType: 'primary',
          defaultTemplateId: '',
        },
      ],
      [{ name: 'standard' }],
    ],
    [
      'NHSAPP,SMS',
      [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: '',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'SMS',
          channelType: 'primary',
          defaultTemplateId: '',
        },
      ],
      [{ name: 'standard' }],
    ],
    [
      'NHSAPP,EMAIL,SMS',
      [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: '',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'EMAIL',
          channelType: 'primary',
          defaultTemplateId: '',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'SMS',
          channelType: 'primary',
          defaultTemplateId: '',
        },
      ],
      [{ name: 'standard' }],
    ],
    [
      'NHSAPP,SMS,EMAIL',
      [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: '',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'SMS',
          channelType: 'primary',
          defaultTemplateId: '',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'EMAIL',
          channelType: 'primary',
          defaultTemplateId: '',
        },
      ],
      [{ name: 'standard' }],
    ],
    [
      'NHSAPP,SMS,LETTER',
      [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: '',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'SMS',
          channelType: 'primary',
          defaultTemplateId: '',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: '',
        },
      ],
      [{ name: 'standard' }],
    ],
    [
      'NHSAPP,EMAIL,SMS,LETTER',
      [
        {
          cascadeGroups: ['standard'],
          channel: 'NHSAPP',
          channelType: 'primary',
          defaultTemplateId: '',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'EMAIL',
          channelType: 'primary',
          defaultTemplateId: '',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'SMS',
          channelType: 'primary',
          defaultTemplateId: '',
        },
        {
          cascadeGroups: ['standard'],
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: '',
        },
      ],
      [{ name: 'standard' }],
    ],
    [
      'LETTER',
      [
        {
          cascadeGroups: ['standard'],
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: '',
        },
      ],
      [{ name: 'standard' }],
    ],
  ];

test.each(MESSAGE_ORDER_SCENARIOS)(
  'creates the routing config with the correct initial cascade for %s message order',
  async (messageOrder, expectedCascade, expectedCascadeGroups) => {
    const user = userEvent.setup();

    render(
      <NextRedirectBoundary>
        <MessagePlanForm
          messageOrder={messageOrder}
          campaignIds={['campaign-1']}
        />
      </NextRedirectBoundary>,
      // @ts-expect-error silence noisy error logging from react error boundary
      { onCaughtError: () => {} }
    );

    await user.click(screen.getByTestId('name-field'));

    await user.keyboard('My Message Plan');

    await user.click(screen.getByTestId('submit-button'));

    expect(createRoutingConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        cascade: expectedCascade,
        cascadeGroupOverrides: expectedCascadeGroups,
      })
    );
  }
);

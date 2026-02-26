import { mock } from 'jest-mock-extended';
import { redirect, RedirectType } from 'next/navigation';
import type {
  CascadeItem,
  RoutingConfig,
} from 'nhs-notify-web-template-management-types';
import type { MessageOrder } from 'nhs-notify-web-template-management-utils';
import { createMessagePlanServerAction } from '@app/message-plans/create-message-plan/server-action';
import { NextRedirectError } from '@testhelpers/next-redirect';
import { createRoutingConfig } from '@utils/message-plans';

jest.mock('next/navigation');
jest.mocked(redirect).mockImplementation((url, type) => {
  throw new NextRedirectError(url, type);
});

jest.mock('@utils/message-plans');
jest.mocked(createRoutingConfig).mockResolvedValue(
  mock<RoutingConfig>({
    id: 'mock-routing-config-id',
  })
);

beforeEach(() => {
  jest.clearAllMocks();
});

const MESSAGE_ORDER_SCENARIOS: [MessageOrder, CascadeItem[]][] = [
  [
    'NHSAPP',
    [
      {
        cascadeGroups: ['standard'],
        channel: 'NHSAPP',
        channelType: 'primary',
        defaultTemplateId: null,
      },
    ],
  ],
  [
    'NHSAPP,EMAIL',
    [
      {
        cascadeGroups: ['standard'],
        channel: 'NHSAPP',
        channelType: 'primary',
        defaultTemplateId: null,
      },
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: null,
      },
    ],
  ],
  [
    'NHSAPP,SMS',
    [
      {
        cascadeGroups: ['standard'],
        channel: 'NHSAPP',
        channelType: 'primary',
        defaultTemplateId: null,
      },
      {
        cascadeGroups: ['standard'],
        channel: 'SMS',
        channelType: 'primary',
        defaultTemplateId: null,
      },
    ],
  ],
  [
    'NHSAPP,EMAIL,SMS',
    [
      {
        cascadeGroups: ['standard'],
        channel: 'NHSAPP',
        channelType: 'primary',
        defaultTemplateId: null,
      },
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: null,
      },
      {
        cascadeGroups: ['standard'],
        channel: 'SMS',
        channelType: 'primary',
        defaultTemplateId: null,
      },
    ],
  ],
  [
    'NHSAPP,SMS,EMAIL',
    [
      {
        cascadeGroups: ['standard'],
        channel: 'NHSAPP',
        channelType: 'primary',
        defaultTemplateId: null,
      },
      {
        cascadeGroups: ['standard'],
        channel: 'SMS',
        channelType: 'primary',
        defaultTemplateId: null,
      },
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: null,
      },
    ],
  ],
  [
    'NHSAPP,SMS,LETTER',
    [
      {
        cascadeGroups: ['standard'],
        channel: 'NHSAPP',
        channelType: 'primary',
        defaultTemplateId: null,
      },
      {
        cascadeGroups: ['standard'],
        channel: 'SMS',
        channelType: 'primary',
        defaultTemplateId: null,
      },
      {
        cascadeGroups: ['standard'],
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: null,
      },
    ],
  ],
  [
    'NHSAPP,EMAIL,SMS,LETTER',
    [
      {
        cascadeGroups: ['standard'],
        channel: 'NHSAPP',
        channelType: 'primary',
        defaultTemplateId: null,
      },
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: null,
      },
      {
        cascadeGroups: ['standard'],
        channel: 'SMS',
        channelType: 'primary',
        defaultTemplateId: null,
      },
      {
        cascadeGroups: ['standard'],
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: null,
      },
    ],
  ],
  [
    'EMAIL',
    [
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: null,
      },
    ],
  ],
  [
    'LETTER',
    [
      {
        cascadeGroups: ['standard'],
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: null,
      },
    ],
  ],
];

test.each(MESSAGE_ORDER_SCENARIOS)(
  'creates a message plan with correct initial cascade for %s message order and redirects to the choose templates page',
  async (messageOrder, expectedCascade) => {
    const form = new FormData();
    form.append('name', 'Message Plan Name');
    form.append('campaignId', 'test-campaign-id');
    form.append('messageOrder', messageOrder);

    await expect(createMessagePlanServerAction({}, form)).rejects.toMatchObject(
      {
        message: 'NEXT_REDIRECT',
        url: '/message-plans/choose-templates/mock-routing-config-id',
        type: RedirectType.push,
      }
    );

    expect(createRoutingConfig).toHaveBeenCalledWith({
      name: 'Message Plan Name',
      campaignId: 'test-campaign-id',
      cascade: expectedCascade,
      cascadeGroupOverrides: [],
    });
  }
);

test('returns error state if name is missing', async () => {
  const form = new FormData();
  form.append('name', '');
  form.append('campaignId', 'test-campaign-id');
  form.append('messageOrder', 'NHSAPP');

  const state = await createMessagePlanServerAction({}, form);

  expect(state).toEqual({
    errorState: {
      fieldErrors: {
        name: ['Enter a message plan name'],
      },
      formErrors: [],
    },
  });
});

test('returns error state if name is too long', async () => {
  const form = new FormData();
  form.append('name', 'x'.repeat(201));
  form.append('campaignId', 'test-campaign-id');
  form.append('messageOrder', 'NHSAPP');

  const state = await createMessagePlanServerAction({}, form);

  expect(state).toEqual({
    errorState: {
      fieldErrors: {
        name: ['Message plan name too long'],
      },
      formErrors: [],
    },
  });
});

test('returns error state if campaign id is empty', async () => {
  const form = new FormData();
  form.append('name', 'My Message Plan');
  form.append('campaignId', '');
  form.append('messageOrder', 'NHSAPP');

  const state = await createMessagePlanServerAction({}, form);

  expect(state).toEqual({
    errorState: {
      fieldErrors: {
        campaignId: ['Select a campaign'],
      },
      formErrors: [],
    },
  });
});

test('returns error state if message order is invalid', async () => {
  const form = new FormData();
  form.append('name', 'My Message Plan');
  form.append('campaignId', 'test-campaign-id');
  form.append('messageOrder', 'INVALID');

  const state = await createMessagePlanServerAction({}, form);

  expect(state).toEqual({
    errorState: {
      fieldErrors: {
        messageOrder: ['Invalid message order selected'],
      },
      formErrors: [],
    },
  });
});

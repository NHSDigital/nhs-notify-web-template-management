import { chooseChannelTemplateAction } from '@forms/ChooseChannelTemplate/server-action';
import {
  EMAIL_TEMPLATE,
  getMockFormData,
  NHS_APP_TEMPLATE,
  ROUTING_CONFIG,
  SMS_TEMPLATE,
  LETTER_TEMPLATE,
} from '@testhelpers/helpers';
import { updateRoutingConfig } from '@utils/message-plans';
import { redirect, RedirectType } from 'next/navigation';

jest.mock('next/navigation');
jest.mock('@utils/message-plans');

jest.mock('@utils/amplify-utils');

test('submit form - validation error', async () => {
  const response = await chooseChannelTemplateAction(
    {
      messagePlan: ROUTING_CONFIG,
      pageHeading: 'Choose an NHS App template',
      templateList: [NHS_APP_TEMPLATE],
      cascadeIndex: 0,
    },
    getMockFormData({})
  );

  expect(response).toEqual(
    expect.objectContaining({
      errorState: {
        fieldErrors: { channelTemplate: ['Choose an NHS App template'] },
        formErrors: [],
      },
    })
  );
});

test('submit form - success updates config and redirects to choose templates', async () => {
  const mockRedirect = jest.mocked(redirect);
  const mockUpdateRoutingConfig = jest.mocked(updateRoutingConfig);

  await chooseChannelTemplateAction(
    {
      messagePlan: {
        ...ROUTING_CONFIG,
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'NHSAPP',
            channelType: 'primary',
            defaultTemplateId: NHS_APP_TEMPLATE.id,
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
            defaultTemplateId: SMS_TEMPLATE.id,
          },
        ],
      },
      pageHeading: 'Choose an email template',
      templateList: [EMAIL_TEMPLATE],
      cascadeIndex: 1,
    },
    getMockFormData({
      channelTemplate: EMAIL_TEMPLATE.id,
    })
  );

  expect(mockUpdateRoutingConfig).toHaveBeenCalledWith(ROUTING_CONFIG.id, {
    cascade: [
      {
        cascadeGroups: ['standard'],
        channel: 'NHSAPP',
        channelType: 'primary',
        defaultTemplateId: NHS_APP_TEMPLATE.id,
      },
      {
        cascadeGroups: ['standard'],
        channel: 'EMAIL',
        channelType: 'primary',
        defaultTemplateId: EMAIL_TEMPLATE.id,
      },
      {
        cascadeGroups: ['standard'],
        channel: 'SMS',
        channelType: 'primary',
        defaultTemplateId: SMS_TEMPLATE.id,
      },
    ],
    cascadeGroupOverrides: ROUTING_CONFIG.cascadeGroupOverrides,
  });

  expect(mockRedirect).toHaveBeenCalledWith(
    `/message-plans/choose-templates/${ROUTING_CONFIG.id}`,
    RedirectType.push
  );
});

test('submit form - success updates config and redirects to choose templates for letter template with supplier references', async () => {
  const mockRedirect = jest.mocked(redirect);
  const mockUpdateRoutingConfig = jest.mocked(updateRoutingConfig);

  await chooseChannelTemplateAction(
    {
      messagePlan: {
        ...ROUTING_CONFIG,
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'LETTER',
            channelType: 'primary',
            defaultTemplateId: 'letter-template-id',
          },
        ],
      },
      pageHeading: 'Choose an email template',
      templateList: [
        {
          ...LETTER_TEMPLATE,
          supplierReferences: {
            MBA: 'mba-supplier-reference',
          },
        },
      ],
      cascadeIndex: 0,
    },
    getMockFormData({
      channelTemplate: LETTER_TEMPLATE.id,
    })
  );

  expect(mockUpdateRoutingConfig).toHaveBeenCalledWith(ROUTING_CONFIG.id, {
    cascade: [
      {
        cascadeGroups: ['standard'],
        channel: 'LETTER',
        channelType: 'primary',
        defaultTemplateId: LETTER_TEMPLATE.id,
        supplierReferences: { MBA: 'mba-supplier-reference' },
      },
    ],
    cascadeGroupOverrides: [],
  });

  expect(mockRedirect).toHaveBeenCalledWith(
    `/message-plans/choose-templates/${ROUTING_CONFIG.id}`,
    RedirectType.push
  );
});

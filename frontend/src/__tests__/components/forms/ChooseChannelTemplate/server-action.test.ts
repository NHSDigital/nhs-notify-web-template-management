import { chooseChannelTemplateAction } from '@forms/ChooseChannelTemplate/server-action';
import {
  EMAIL_TEMPLATE,
  getMockFormData,
  NHS_APP_TEMPLATE,
  ROUTING_CONFIG,
  SMS_TEMPLATE,
  LETTER_TEMPLATE,
  LARGE_PRINT_LETTER_TEMPLATE,
} from '@testhelpers/helpers';
import { updateRoutingConfig } from '@utils/message-plans';
import { redirect, RedirectType } from 'next/navigation';

jest.mock('next/navigation');
jest.mock('@utils/message-plans');

jest.mock('@utils/amplify-utils');

beforeEach(() => {
  jest.clearAllMocks();
});

test('submit form - validation error', async () => {
  const response = await chooseChannelTemplateAction(
    {
      messagePlan: ROUTING_CONFIG,
      pageHeading: 'Choose an NHS App template',
      cascadeIndex: 0,
      templateList: [NHS_APP_TEMPLATE],
    },
    getMockFormData({})
  );

  expect(response).toEqual(
    expect.objectContaining({
      errorState: {
        fieldErrors: expect.objectContaining({
          channelTemplate: ['Choose an NHS App template'],
        }),
        formErrors: [],
      },
    })
  );
});

test('submit form - success updates config and redirects to choose templates', async () => {
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
      cascadeIndex: 1,
      templateList: [EMAIL_TEMPLATE],
    },
    getMockFormData({
      channelTemplate: EMAIL_TEMPLATE.id,
      lockNumber: String(EMAIL_TEMPLATE.lockNumber),
    })
  );

  expect(updateRoutingConfig).toHaveBeenCalledWith(
    ROUTING_CONFIG.id,
    {
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
    },
    EMAIL_TEMPLATE.lockNumber
  );

  expect(redirect).toHaveBeenCalledWith(
    `/message-plans/choose-templates/${ROUTING_CONFIG.id}`,
    RedirectType.push
  );
});

test('submit form - success updates config and redirects to choose templates for letter template with supplier references', async () => {
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
      lockNumber: String(LETTER_TEMPLATE.lockNumber),
    })
  );

  expect(updateRoutingConfig).toHaveBeenCalledWith(
    ROUTING_CONFIG.id,
    {
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
    },
    LETTER_TEMPLATE.lockNumber
  );

  expect(redirect).toHaveBeenCalledWith(
    `/message-plans/choose-templates/${ROUTING_CONFIG.id}`,
    RedirectType.push
  );
});

test('submit form - success adds conditional template and updates cascade group overrides', async () => {
  const mockRedirect = jest.mocked(redirect);
  const mockUpdateRoutingConfig = jest.mocked(updateRoutingConfig);

  const largePrintTemplate = {
    ...LARGE_PRINT_LETTER_TEMPLATE,
    id: 'large-print-template-id',
    name: 'Large print letter',
    letterType: 'x1' as const,
    supplierReferences: { MBA: 'large-print-ref' },
  };

  await chooseChannelTemplateAction(
    {
      messagePlan: {
        ...ROUTING_CONFIG,
        cascade: [
          {
            cascadeGroups: ['standard'],
            channel: 'LETTER',
            channelType: 'primary',
            defaultTemplateId: LETTER_TEMPLATE.id,
          },
        ],
        cascadeGroupOverrides: [],
      },
      pageHeading: 'Choose a large print letter template',
      templateList: [largePrintTemplate],
      cascadeIndex: 0,
      accessibleFormat: 'x1',
    },
    getMockFormData({
      channelTemplate: largePrintTemplate.id,
      lockNumber: String(largePrintTemplate.lockNumber),
    })
  );

  expect(mockUpdateRoutingConfig).toHaveBeenCalledWith(
    ROUTING_CONFIG.id,
    {
      cascade: [
        {
          cascadeGroups: ['standard'],
          channel: 'LETTER',
          channelType: 'primary',
          defaultTemplateId: LETTER_TEMPLATE.id,
          conditionalTemplates: [
            {
              accessibleFormat: 'x1',
              templateId: largePrintTemplate.id,
              supplierReferences: { MBA: 'large-print-ref' },
            },
          ],
        },
      ],
      cascadeGroupOverrides: [{ name: 'accessible', accessibleFormat: ['x1'] }],
    },
    largePrintTemplate.lockNumber
  );

  expect(mockRedirect).toHaveBeenCalledWith(
    `/message-plans/choose-templates/${ROUTING_CONFIG.id}`,
    RedirectType.push
  );
});

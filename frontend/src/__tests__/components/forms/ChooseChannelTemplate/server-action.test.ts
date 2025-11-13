import { chooseChannelTemplateAction } from '@forms/ChooseChannelTemplate/server-action';
import {
  getMockFormData,
  NHS_APP_TEMPLATE,
  ROUTING_CONFIG,
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
            defaultTemplateId: null,
          },
        ],
      },
      pageHeading: 'Choose an NHS App template',
      templateList: [NHS_APP_TEMPLATE],
      cascadeIndex: 0,
    },
    getMockFormData({
      channelTemplate: NHS_APP_TEMPLATE.id,
    })
  );

  expect(mockUpdateRoutingConfig).toHaveBeenCalledWith(ROUTING_CONFIG.id, {
    ...ROUTING_CONFIG,
    cascade: [
      {
        cascadeGroups: ['standard'],
        channel: 'NHSAPP',
        channelType: 'primary',
        defaultTemplateId: NHS_APP_TEMPLATE.id,
      },
    ],
  });

  expect(mockRedirect).toHaveBeenCalledWith(
    `/message-plans/choose-templates/${ROUTING_CONFIG.id}`,
    RedirectType.push
  );
});

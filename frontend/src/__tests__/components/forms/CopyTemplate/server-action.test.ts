import { copyTemplateAction } from '@forms/CopyTemplate/server-action';
import { getMockFormData } from '@testhelpers/helpers';
import {
  EmailTemplate,
  NHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { redirect, RedirectType } from 'next/navigation';
import { createTemplate } from '@utils/form-actions';

jest.mock('next/navigation');
jest.mock('@utils/form-actions');

jest.mock('@utils/amplify-utils');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2022-01-01 09:00:00'));
});

test('submit form - validation error', async () => {
  const template: NHSAppTemplate = {
    id: 'template-id',
    templateStatus: 'NOT_YET_SUBMITTED',
    templateType: 'NHS_APP',
    name: 'template-name',
    message: 'template-message',
    createdAt: 'today',
    updatedAt: 'today',
    lockNumber: 1,
  };

  const response = await copyTemplateAction(
    {
      template,
    },
    getMockFormData({
      templateType: 'lemons',
    })
  );

  expect(response).toEqual({
    errorState: {
      formErrors: [],
      fieldErrors: {
        templateType: ['Select a template type'],
      },
    },
    template,
  });
});

test('submit form - create email template from non-email template', async () => {
  const mockRedirect = jest.mocked(redirect);
  const mockCreateTemplate = jest.mocked(createTemplate);

  const testTemplate: Omit<NHSAppTemplate, 'id' | 'templateType'> = {
    templateStatus: 'NOT_YET_SUBMITTED',
    name: 'template-name',
    message: 'template-message',
    createdAt: 'today',
    updatedAt: 'today',
    lockNumber: 1,
  };

  await copyTemplateAction(
    {
      template: {
        ...testTemplate,
        templateType: 'NHS_APP' as const,
        id: 'template-id',
      },
    },
    getMockFormData({
      templateType: 'EMAIL',
    })
  );

  expect(mockRedirect).toHaveBeenCalledWith(
    '/message-templates',
    RedirectType.push
  );

  expect(mockCreateTemplate).toHaveBeenCalledWith({
    message: testTemplate.message,
    subject: 'Enter a subject line',
    name: 'COPY (2022-01-01 09:00:00): template-name',
    templateType: 'EMAIL',
  });
});

test('submit form - create email template from email template', async () => {
  const mockRedirect = jest.mocked(redirect);
  const mockCreateTemplate = jest.mocked(createTemplate);

  const testTemplate: Omit<EmailTemplate, 'id' | 'templateType'> = {
    templateStatus: 'NOT_YET_SUBMITTED',
    name: 'template-name',
    message: 'template-message',
    subject: 'template-subject',
    createdAt: 'today',
    updatedAt: 'today',
    lockNumber: 1,
  };

  await copyTemplateAction(
    {
      template: {
        ...testTemplate,
        templateType: 'EMAIL',
        id: 'template-id',
      },
    },
    getMockFormData({
      templateType: 'EMAIL',
    })
  );

  expect(mockRedirect).toHaveBeenCalledWith(
    '/message-templates',
    RedirectType.push
  );

  expect(mockCreateTemplate).toHaveBeenCalledWith({
    message: testTemplate.message,
    subject: testTemplate.subject,
    name: 'COPY (2022-01-01 09:00:00): template-name',
    templateType: 'EMAIL',
  });
});

test('submit form - create non-email template', async () => {
  const mockRedirect = jest.mocked(redirect);
  const mockCreateTemplate = jest.mocked(createTemplate);

  const testTemplate: Omit<NHSAppTemplate, 'id' | 'templateType'> = {
    templateStatus: 'NOT_YET_SUBMITTED',
    name: 'template-name',
    message: 'template-message',
    createdAt: 'today',
    updatedAt: 'today',
    lockNumber: 1,
  };

  await copyTemplateAction(
    {
      template: {
        ...testTemplate,
        templateType: 'NHS_APP',
        id: 'template-id',
      },
    },
    getMockFormData({
      templateType: 'NHS_APP',
    })
  );

  expect(mockRedirect).toHaveBeenCalledWith(
    '/message-templates',
    RedirectType.push
  );

  expect(mockCreateTemplate).toHaveBeenCalledWith({
    message: testTemplate.message,
    name: 'COPY (2022-01-01 09:00:00): template-name',
    templateType: 'NHS_APP',
  });
});

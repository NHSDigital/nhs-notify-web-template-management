import { copyTemplateAction } from '@forms/CopyTemplate/server-action';
import { getMockFormData } from '@testhelpers';
import {
  EmailTemplate,
  NHSAppTemplate,
  TemplateStatus,
  TemplateType,
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
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    templateType: TemplateType.NHS_APP,
    name: 'template-name',
    message: 'template-message',
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
    validationError: {
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

  const testTemplate: Omit<NHSAppTemplate, 'id'> = {
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    templateType: TemplateType.NHS_APP,
    name: 'template-name',
    message: 'template-message',
  };

  await copyTemplateAction(
    {
      template: {
        ...testTemplate,
        id: 'template-id',
      },
    },
    getMockFormData({
      templateType: TemplateType.EMAIL,
    })
  );

  expect(mockRedirect).toHaveBeenCalledWith(
    '/manage-templates',
    RedirectType.push
  );

  expect(mockCreateTemplate).toHaveBeenCalledWith({
    ...testTemplate,
    subject: 'Enter a subject line',
    name: 'COPY (2022-01-01 09:00:00): template-name',
    templateType: TemplateType.EMAIL,
  });
});

test('submit form - create email template from email template', async () => {
  const mockRedirect = jest.mocked(redirect);
  const mockCreateTemplate = jest.mocked(createTemplate);

  const testTemplate: Omit<EmailTemplate, 'id'> = {
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    templateType: TemplateType.EMAIL,
    name: 'template-name',
    message: 'template-message',
    subject: 'template-subject',
  };

  await copyTemplateAction(
    {
      template: {
        ...testTemplate,
        id: 'template-id',
      },
    },
    getMockFormData({
      templateType: TemplateType.EMAIL,
    })
  );

  expect(mockRedirect).toHaveBeenCalledWith(
    '/manage-templates',
    RedirectType.push
  );

  expect(mockCreateTemplate).toHaveBeenCalledWith({
    ...testTemplate,
    name: 'COPY (2022-01-01 09:00:00): template-name',
    templateType: TemplateType.EMAIL,
  });
});

test('submit form - create non-email template', async () => {
  const mockRedirect = jest.mocked(redirect);
  const mockCreateTemplate = jest.mocked(createTemplate);

  const testTemplate: Omit<NHSAppTemplate, 'id'> = {
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    templateType: TemplateType.NHS_APP,
    name: 'template-name',
    message: 'template-message',
  };

  await copyTemplateAction(
    {
      template: {
        ...testTemplate,
        id: 'template-id',
      },
    },
    getMockFormData({
      templateType: TemplateType.NHS_APP,
    })
  );

  expect(mockRedirect).toHaveBeenCalledWith(
    '/manage-templates',
    RedirectType.push
  );

  expect(mockCreateTemplate).toHaveBeenCalledWith({
    ...testTemplate,
    name: 'COPY (2022-01-01 09:00:00): template-name',
    templateType: TemplateType.NHS_APP,
  });
});

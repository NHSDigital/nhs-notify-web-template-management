import { redirect } from 'next/navigation';
import { createNhsAppTemplateAction } from '@forms/CreateNhsAppTemplate/server-action';
import { getMockFormData } from '@/src/__tests__/helpers';
import { TemplateType } from '@/src/utils/types';

jest.mock('next/navigation');

jest.mock('@/src/utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => ({
    models: {
      SessionStorage: {
        update: () => ({ data: {} }),
      },
    },
  }),
}));

test('invalid form id', async () => {
  const mockRedirect = jest.mocked(redirect);

  const response = await createNhsAppTemplateAction(
    {
      id: 'session-id',
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
    getMockFormData({
      'form-id': 'lemons',
    })
  );

  expect(mockRedirect).not.toHaveBeenCalled();

  expect(response).toEqual({
    id: 'session-id',
    templateType: TemplateType.NHS_APP,
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
    validationError: {
      formErrors: [],
      fieldErrors: {
        formId: ['Internal server error'],
      },
    },
  });
});

test('submit form - no validation error', async () => {
  const mockRedirect = jest.mocked(redirect);

  await createNhsAppTemplateAction(
    {
      id: 'session-id',
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
    getMockFormData({
      'form-id': 'create-nhs-app-template',
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: 'template-message',
    })
  );

  expect(mockRedirect).toHaveBeenCalledWith(
    '/preview-nhs-app-template/session-id'
  );
});

test('submit form - validation error', async () => {
  const mockRedirect = jest.mocked(redirect);

  const response = await createNhsAppTemplateAction(
    {
      id: 'session-id',
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
    getMockFormData({
      'form-id': 'create-nhs-app-template',
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage:
        'this template message is very loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong',
    })
  );

  expect(mockRedirect).not.toHaveBeenCalled();

  expect(response).toEqual({
    id: 'session-id',
    templateType: TemplateType.NHS_APP,
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
    validationError: {
      formErrors: [],
      fieldErrors: {
        nhsAppTemplateMessage: ['Template message too long'],
      },
    },
  });
});

test('back - no validation error', async () => {
  const mockRedirect = jest.mocked(redirect);

  await createNhsAppTemplateAction(
    {
      id: 'session-id',
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
    getMockFormData({
      'form-id': 'create-nhs-app-template-back',
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: 'template-message',
    })
  );

  expect(mockRedirect).toHaveBeenCalledWith(
    '/choose-a-template-type/session-id'
  );
});

test('back - validation error', async () => {
  const mockRedirect = jest.mocked(redirect);

  const response = await createNhsAppTemplateAction(
    {
      id: 'session-id',
      templateType: TemplateType.NHS_APP,
      nhsAppTemplateName: '',
      nhsAppTemplateMessage: '',
    },
    getMockFormData({
      'form-id': 'create-nhs-app-template-back',
      nhsAppTemplateName: 'template-name',
      nhsAppTemplateMessage: 7 as unknown as string,
    })
  );

  expect(mockRedirect).not.toHaveBeenCalled();

  expect(response).toEqual({
    id: 'session-id',
    templateType: TemplateType.NHS_APP,
    nhsAppTemplateName: '',
    nhsAppTemplateMessage: '',
    validationError: {
      formErrors: [],
      fieldErrors: {
        nhsAppTemplateMessage: ['Internal server error'],
      },
    },
  });
});

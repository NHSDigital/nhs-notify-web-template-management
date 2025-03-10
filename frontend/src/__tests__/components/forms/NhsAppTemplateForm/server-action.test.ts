import { getMockFormData } from '@testhelpers';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import {
  NHSAppTemplate,
  TemplateType,
  TemplateStatus,
  CreateNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/NhsAppTemplateForm/server-action';

jest.mock('@utils/amplify-utils');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const saveTemplateMock = jest.mocked(saveTemplate);
const createTemplateMock = jest.mocked(createTemplate);
const redirectMock = jest.mocked(redirect);

const initialState: CreateNHSAppTemplate = {
  templateType: TemplateType.NHS_APP,
  name: 'name',
  message: 'message',
};

const savedState: NHSAppTemplate = {
  ...initialState,
  id: 'template-id',
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
};

describe('CreateNHSAppTemplate server actions', () => {
  beforeEach(jest.resetAllMocks);

  it('create-nhs-app-template - should return response when no template name or template message', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({ 'form-id': 'create-nhs-app-template' })
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          nhsAppTemplateName: ['Enter a template name'],
          nhsAppTemplateMessage: ['Enter a template message'],
        },
      },
    });
  });

  it('create-nhs-app-template - should return response when when template message is too long', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({
        'form-id': 'create-nhs-app-template',
        nhsAppTemplateName: 'template-name',
        nhsAppTemplateMessage: 'a'.repeat(5001),
      })
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          nhsAppTemplateMessage: ['Template message too long'],
        },
      },
    });
  });

  test('should save the template and redirect', async () => {
    saveTemplateMock.mockResolvedValue({
      ...savedState,
      name: 'template-name',
      message: 'template-message',
    });

    await processFormActions(
      savedState,
      getMockFormData({
        nhsAppTemplateName: 'template-name',
        nhsAppTemplateMessage: 'template-message',
      })
    );

    expect(saveTemplateMock).toHaveBeenCalledWith({
      ...savedState,
      name: 'template-name',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      `/preview-nhs-app-template/template-id?from=edit`,
      'push'
    );
  });

  test('should create the template and redirect', async () => {
    createTemplateMock.mockResolvedValue(savedState);

    await processFormActions(
      initialState,
      getMockFormData({
        nhsAppTemplateName: 'template-name',
        nhsAppTemplateMessage: 'template-message',
      })
    );

    expect(createTemplateMock).toHaveBeenCalledWith({
      ...initialState,
      name: 'template-name',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-nhs-app-template/template-id?from=edit',
      'push'
    );
  });
});

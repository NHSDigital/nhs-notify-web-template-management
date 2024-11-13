import { getMockFormData } from '@testhelpers';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import { NHSAppTemplate } from '@utils/types';
import { TemplateType, TemplateStatus } from '@utils/enum';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/NhsAppTemplateForm/server-action';

jest.mock('@utils/amplify-utils', () => ({
  getAmplifyBackendClient: () => ({
    models: {
      TemplateStorage: {
        update: () => ({ data: {} }),
      },
    },
  }),
}));
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const saveTemplateMock = jest.mocked(saveTemplate);
const createTemplateMock = jest.mocked(createTemplate);
const redirectMock = jest.mocked(redirect);

const initialState: NHSAppTemplate = {
  id: 'template-id',
  version: 1,
  templateType: TemplateType.NHS_APP,
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: 'name',
  message: 'message',
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
      ...initialState,
      name: 'template-name',
      message: 'template-message',
    });

    await processFormActions(
      initialState,
      getMockFormData({
        nhsAppTemplateName: 'template-name',
        nhsAppTemplateMessage: 'template-message',
      })
    );

    expect(saveTemplateMock).toHaveBeenCalledWith({
      ...initialState,
      name: 'template-name',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      `/preview-nhs-app-template/template-id`,
      'push'
    );
  });

  test('should create the template and redirect', async () => {
    const { id: _, ...initialDraftState } = initialState; // eslint-disable-line sonarjs/sonar-no-unused-vars

    createTemplateMock.mockResolvedValue({
      ...initialDraftState,
      id: 'new-template-id',
      name: 'template-name',
      message: 'template-message',
    });

    await processFormActions(
      initialDraftState,
      getMockFormData({
        nhsAppTemplateName: 'template-name',
        nhsAppTemplateMessage: 'template-message',
      })
    );

    expect(createTemplateMock).toHaveBeenCalledWith({
      ...initialDraftState,
      name: 'template-name',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      '/preview-nhs-app-template/new-template-id',
      'push'
    );
  });
});

import { getMockFormData } from '@testhelpers';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import { NHSAppTemplate } from '@utils/types';
import { TemplateType } from '@utils/enum';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/CreateNhsAppTemplate/server-action';

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
  name: 'name',
  message: 'message',
};

describe('CreateNHSAppTemplate server actions', () => {
  beforeEach(jest.resetAllMocks);

  it('should return response when no form-id', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({})
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: ['Internal server error'],
        fieldErrors: {},
      },
    });
  });

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

  it('create-nhs-app-template-back - should return response when no template name or template message', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({ 'form-id': 'create-nhs-app-template-back' })
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          nhsAppTemplateName: ['Internal server error'],
          nhsAppTemplateMessage: ['Internal server error'],
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

  test.each([
    { formId: 'create-nhs-app-template', route: 'preview-nhs-app-template' },
    { formId: 'create-nhs-app-template-back', route: 'choose-a-template-type' },
  ])(
    '$formId - should save the template and redirect to $route',
    async ({ formId, route }) => {
      saveTemplateMock.mockResolvedValue({
        ...initialState,
        name: 'template-name',
        message: 'template-message',
      });

      await processFormActions(
        initialState,
        getMockFormData({
          'form-id': formId,
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
        `/${route}/template-id`,
        'push'
      );
    }
  );

  test.each([
    { formId: 'create-nhs-app-template', route: 'preview-nhs-app-template' },
    { formId: 'create-nhs-app-template-back', route: 'choose-a-template-type' },
  ])(
    '$formId - should create the template and redirect to $route',
    async ({ formId, route }) => {
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
          'form-id': formId,
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
        `/${route}/new-template-id`,
        'push'
      );
    }
  );
});

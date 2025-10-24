import { getMockFormData } from '@testhelpers/helpers';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import type {
  NHSAppTemplate,
  CreateUpdateNHSAppTemplate,
} from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/NhsAppTemplateForm/server-action';

jest.mock('@utils/amplify-utils');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const saveTemplateMock = jest.mocked(saveTemplate);
const createTemplateMock = jest.mocked(createTemplate);
const redirectMock = jest.mocked(redirect);

const initialState: CreateUpdateNHSAppTemplate = {
  templateType: 'NHS_APP',
  name: 'name',
  message: 'message',
};

const savedState: NHSAppTemplate = {
  ...initialState,
  id: 'a28c9e75-d6c9-4efe-879e-e082238938cf',
  templateStatus: 'NOT_YET_SUBMITTED',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
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
      errorState: {
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
      errorState: {
        formErrors: [],
        fieldErrors: {
          nhsAppTemplateMessage: ['Template message too long'],
        },
      },
    });
  });

  it('create-nhs-app-template - should return response when when template message contains insecure url', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({
        'form-id': 'create-nhs-app-template',
        nhsAppTemplateName: 'template-name',
        nhsAppTemplateMessage:
          '**a message linking to http://www.example.com**',
      })
    );

    expect(response).toEqual({
      ...initialState,
      errorState: {
        formErrors: [],
        fieldErrors: {
          nhsAppTemplateMessage: ['URLs must start with https://'],
        },
      },
    });
  });

  it('create-nhs-app-template - should return response when when template message contains link with angle brackets', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({
        'form-id': 'create-nhs-app-template',
        nhsAppTemplateName: 'template-name',
        nhsAppTemplateMessage:
          '**a message linking to [example.com](https://www.example.com/withparams?param1=<>)**',
      })
    );

    expect(response).toEqual({
      ...initialState,
      errorState: {
        formErrors: [],
        fieldErrors: {
          nhsAppTemplateMessage: ['URLs cannot include the symbols < or >'],
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

    expect(saveTemplateMock).toHaveBeenCalledWith(savedState.id, {
      ...savedState,
      name: 'template-name',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      `/preview-nhs-app-template/${savedState.id}?from=edit`,
      'push'
    );
  });

  test('redirects to invalid-template if the ID in formState is not a uuid', async () => {
    const badIdState = {
      ...savedState,
      id: 'no-uuid',
    };

    await processFormActions(
      badIdState,
      getMockFormData({
        nhsAppTemplateName: 'template-name',
        nhsAppTemplateMessage: 'template-message',
      })
    );

    expect(saveTemplateMock).not.toHaveBeenCalled();

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test('should save a template that contains a url with angle brackets, if they are url encoded', async () => {
    saveTemplateMock.mockResolvedValue({
      ...savedState,
      name: 'template-name',
      message:
        '**a message linking to [example.com](https://www.example.com/withparams?param1=%3C%3E)**',
    });

    await processFormActions(
      savedState,
      getMockFormData({
        nhsAppTemplateName: 'template-name',
        nhsAppTemplateMessage:
          '**a message linking to [example.com](https://www.example.com/withparams?param1=%3C%3E)**',
      })
    );

    expect(saveTemplateMock).toHaveBeenCalledWith(savedState.id, {
      ...savedState,
      name: 'template-name',
      message:
        '**a message linking to [example.com](https://www.example.com/withparams?param1=%3C%3E)**',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      `/preview-nhs-app-template/${savedState.id}?from=edit`,
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
      `/preview-nhs-app-template/${savedState.id}?from=edit`,
      'push'
    );
  });
});

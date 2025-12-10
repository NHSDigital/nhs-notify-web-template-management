import { getMockFormData } from '@testhelpers/helpers';
import { saveTemplate, createTemplate } from '@utils/form-actions';
import { SMSTemplate } from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { processFormActions } from '@forms/SmsTemplateForm/server-action';
import { TemplateDto } from 'nhs-notify-backend-client';

jest.mock('@utils/amplify-utils');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const saveTemplateMock = jest.mocked(saveTemplate);
const createTemplateMock = jest.mocked(createTemplate);
const redirectMock = jest.mocked(redirect);

const initialState: SMSTemplate = {
  id: '9e23faa1-521d-4708-8edb-be42ed4a3aae',
  templateType: 'SMS',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'name',
  message: 'message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

describe('CreateSmsTemplate server actions', () => {
  beforeEach(jest.resetAllMocks);

  it('create-sms-template - should return response when no template name or template message', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({ 'form-id': 'create-sms-template' })
    );

    expect(response).toEqual({
      ...initialState,
      errorState: {
        formErrors: [],
        fieldErrors: {
          smsTemplateName: ['Enter a template name'],
          smsTemplateMessage: ['Enter a template message'],
        },
      },
    });
  });

  it('create-sms-template - should return response when when template message is too long', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({
        'form-id': 'create-sms-template',
        smsTemplateName: 'template-name',
        smsTemplateMessage: 'a'.repeat(919),
      })
    );

    expect(response).toEqual({
      ...initialState,
      errorState: {
        formErrors: [],
        fieldErrors: {
          smsTemplateMessage: ['Template message too long'],
        },
      },
    });
  });

  it('create-sms-template - should return response when when template message contains insecure url', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({
        'form-id': 'create-sms-template',
        smsTemplateName: 'template-name',
        smsTemplateMessage:
          'a message linking to http://www.example.com with http',
      })
    );

    expect(response).toEqual({
      ...initialState,
      errorState: {
        formErrors: [],
        fieldErrors: {
          smsTemplateMessage: ['URLs must start with https://'],
        },
      },
    });
  });

  it('create-sms-template - should return response when when template message contains unsupported personalisation', async () => {
    const response = await processFormActions(
      initialState,
      getMockFormData({
        'form-id': 'create-sms-template',
        smsTemplateName: 'template-name',
        smsTemplateMessage: 'a template message containing ((date))',
      })
    );

    expect(response).toEqual({
      ...initialState,
      errorState: {
        formErrors: [],
        fieldErrors: {
          smsTemplateMessage: [
            'You cannot use the following custom personalisation fields in your message: date, address_line_1, address_line_2, address_line_3, address_line_4, address_line_5, address_line_6, address_line_7',
          ],
        },
      },
    });
  });

  test('should save the template and redirect', async () => {
    saveTemplateMock.mockResolvedValue({
      ...initialState,
      name: 'template-name',
      message: 'template-message',
    } as TemplateDto);

    await processFormActions(
      initialState,
      getMockFormData({
        smsTemplateName: 'template-name',
        smsTemplateMessage: 'template-message',
      })
    );

    expect(saveTemplateMock).toHaveBeenCalledWith(initialState.id, {
      ...initialState,
      name: 'template-name',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      `/preview-text-message-template/${initialState.id}?from=edit`,
      'push'
    );
  });

  test('redirects to invalid-template if the ID in formState is not a uuid', async () => {
    const badIdState = {
      ...initialState,
      id: 'non-uuid',
    };

    await processFormActions(
      badIdState,
      getMockFormData({
        smsTemplateName: 'template-name',
        smsTemplateMessage: 'template-message',
      })
    );

    expect(saveTemplateMock).not.toHaveBeenCalled();

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test('should create the template and redirect', async () => {
    const { id: _, ...initialDraftState } = initialState; // eslint-disable-line sonarjs/no-unused-vars

    const generatedId = '1cc83326-2076-4917-9920-6b297c20d08a';

    createTemplateMock.mockResolvedValue({
      ...initialDraftState,
      id: generatedId,
      name: 'template-name',
      message: 'template-message',
    } as TemplateDto);

    await processFormActions(
      initialDraftState,
      getMockFormData({
        smsTemplateName: 'template-name',
        smsTemplateMessage: 'template-message',
      })
    );

    expect(createTemplateMock).toHaveBeenCalledWith({
      ...initialDraftState,
      name: 'template-name',
      message: 'template-message',
    });

    expect(redirectMock).toHaveBeenCalledWith(
      `/preview-text-message-template/${generatedId}?from=edit`,
      'push'
    );
  });
});

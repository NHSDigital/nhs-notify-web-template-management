import { mockDeep } from 'jest-mock-extended';
import {
  renderMarkdown,
  reviewSmsTemplateAction,
  $FormSchema,
} from '@forms/ReviewSMSTemplate';
import { MarkdownItWrapper } from '@utils/markdownit';
import { redirect } from 'next/navigation';
import { SMSTemplate } from '@utils/types';
import { TemplateType } from '@utils/enum';
import { getMockFormData } from '@testhelpers';
import { markdown } from '../fixtures';

jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);

const initialState: SMSTemplate = {
  id: 'template-id',
  version: 1,
  templateType: TemplateType.SMS,
  name: 'template-name',
  message: 'template-message',
};

describe('PreviewTextMessageActions', () => {
  beforeEach(jest.resetAllMocks);

  it('should enable text message markdown rules', () => {
    const markdownItWrapperMock = mockDeep<MarkdownItWrapper>();

    markdownItWrapperMock.enableLineBreak.mockReturnValue(
      markdownItWrapperMock
    );

    renderMarkdown('message', markdownItWrapperMock);

    expect(markdownItWrapperMock.enableLineBreak).not.toHaveBeenCalled();

    expect(markdownItWrapperMock.enable).not.toHaveBeenCalled();
  });

  it('should only process text message markdown rules', () => {
    expect(renderMarkdown(markdown)).toMatchSnapshot();
  });
});

describe('reviewSmsTemplateAction server action', () => {
  beforeEach(jest.resetAllMocks);

  it('should return state when validation fails', async () => {
    const response = await reviewSmsTemplateAction(
      initialState,
      getMockFormData({})
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          reviewSMSTemplateAction: ['Select an option'],
        },
      },
    });
  });

  it('should redirect to create-text-message-template page when sms-edit is selected', async () => {
    await reviewSmsTemplateAction(
      initialState,
      getMockFormData({
        reviewSMSTemplateAction: 'sms-edit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/edit-text-message-template/template-id',
      'push'
    );
  });

  it('should redirect to submit-text-message-template page when sms-submit is selected', async () => {
    await reviewSmsTemplateAction(
      initialState,
      getMockFormData({
        reviewSMSTemplateAction: 'sms-submit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/submit-text-message-template/template-id',
      'push'
    );
  });

  it('should throw error when review action is unknown', async () => {
    jest.spyOn($FormSchema, 'safeParse').mockReturnValue({
      success: true,
      data: {
        reviewSMSTemplateAction: 'unknown' as never,
      },
    });

    await expect(
      reviewSmsTemplateAction(
        initialState,
        getMockFormData({
          reviewSMSTemplateAction: 'unknown',
        })
      )
    ).rejects.toThrow('Unknown review sms template action.');
  });
});

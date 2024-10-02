import { mockDeep } from 'jest-mock-extended';
import {
  renderMarkdown,
  reviewEmailTemplateAction,
  $FormSchema,
} from '@forms/ReviewEmailTemplate';
import { MarkdownItWrapper } from '@utils/markdownit';
import { redirect } from 'next/navigation';
import { Session, TemplateType } from '@utils/types';
import { getMockFormData } from '@testhelpers';
import { markdown } from '../fixtures';

jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);

const initialState: Session = {
  id: 'session-id',
  templateType: TemplateType.EMAIL,
  nhsAppTemplateName: '',
  nhsAppTemplateMessage: '',
};

describe('PreviewEmailActions', () => {
  beforeEach(jest.resetAllMocks);

  it('should enable email markdown rules', () => {
    const markdownItWrapperMock = mockDeep<MarkdownItWrapper>();

    markdownItWrapperMock.enableLineBreak.mockReturnValue(
      markdownItWrapperMock
    );

    renderMarkdown('message', markdownItWrapperMock);

    expect(markdownItWrapperMock.enableLineBreak).toHaveBeenCalled();
    expect(markdownItWrapperMock.enable).toHaveBeenCalledWith([
      'heading',
      'link',
      'list',
      'emphasis',
      'hr',
    ]);
  });

  it('should only process text message markdown rules', () => {
    expect(renderMarkdown(markdown)).toMatchSnapshot();
  });
});

describe('reviewEmailTemplateAction server action', () => {
  beforeEach(jest.resetAllMocks);

  it('should return state when validation fails', async () => {
    const response = await reviewEmailTemplateAction(
      initialState,
      getMockFormData({})
    );

    expect(response).toEqual({
      ...initialState,
      validationError: {
        formErrors: [],
        fieldErrors: {
          reviewEmailTemplateAction: ['Select an option'],
        },
      },
    });
  });

  it('should redirect to create-email-template page when email-edit is selected', async () => {
    await reviewEmailTemplateAction(
      initialState,
      getMockFormData({
        reviewEmailTemplateAction: 'email-edit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/create-email-template/session-id',
      'push'
    );
  });

  it('should redirect to submit-email-template page when email-submit is selected', async () => {
    await reviewEmailTemplateAction(
      initialState,
      getMockFormData({
        reviewEmailTemplateAction: 'email-submit',
      })
    );

    expect(redirectMock).toHaveBeenCalledWith(
      '/submit-email-template/session-id',
      'push'
    );
  });

  it('should throw error when review action is unknown', async () => {
    jest.spyOn($FormSchema, 'safeParse').mockReturnValue({
      success: true,
      data: {
        reviewEmailTemplateAction: 'unknown' as never,
      },
    });

    await expect(
      reviewEmailTemplateAction(
        initialState,
        getMockFormData({
          reviewEmailTemplateAction: 'unknown',
        })
      )
    ).rejects.toThrow('Unknown review email template action.');
  });
});

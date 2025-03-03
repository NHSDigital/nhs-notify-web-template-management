/**
 * @jest-environment node
 */
import PreviewSMSTemplatePage from '@app/preview-text-message-template/[templateId]/page';
import { ReviewSMSTemplate } from '@forms/ReviewSMSTemplate';
import {
  SMSTemplate,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { Language, LetterType, TemplateDTO } from 'nhs-notify-backend-client';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/ReviewSMSTemplate');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('PreviewSMSTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const templateDTO = {
      id: 'template-id',
      templateType: TemplateType.SMS,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
      name: 'template-name',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDTO;

    const smsTemplate: SMSTemplate = {
      ...templateDTO,
      templateType: TemplateType.SMS,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    };

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await PreviewSMSTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(<ReviewSMSTemplate initialState={smsTemplate} />);
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await PreviewSMSTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      templateType: TemplateType.EMAIL,
      name: 'template-name',
      message: 'template-message',
    },
    {
      templateType: TemplateType.NHS_APP,
      name: 'template-name',
      message: 'template-message',
    },
    {
      templateType: TemplateType.LETTER,
      name: 'template-name',
      letterType: LetterType.X0,
      language: Language.EN,
      pdfTemplateInputFile: 'template.pdf',
      testPersonalisationInputFile: 'test-data.csv',
    },
    {
      templateType: TemplateType.SMS,
      name: 'template-name',
      message: undefined as unknown as string,
    },
    {
      templateType: TemplateType.SMS,
      name: undefined as unknown as string,
      message: 'template-message',
    },
    {
      templateType: TemplateType.SMS,
      name: null as unknown as string,
      message: null as unknown as string,
    },
  ])(
    'should redirect to invalid-template when template is $templateType and name is $smsTemplateName and message is $smsTemplateMessage',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce({
        id: 'template-id',
        templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
        ...value,
        createdAt: 'today',
        updatedAt: 'today',
      });

      await PreviewSMSTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});

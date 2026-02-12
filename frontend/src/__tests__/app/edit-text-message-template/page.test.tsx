/**
 * @jest-environment node
 */
import EditSmsTemplatePage, {
  generateMetadata,
} from '@app/edit-text-message-template/[templateId]/page';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';
import { TemplateDto } from 'nhs-notify-backend-client';
import { NHSNotifyContainer } from '@layouts/container/container';
import { SMSTemplate } from 'nhs-notify-web-template-management-utils';
import content from '@content/content';

const { editPageTitle } = content.components.templateFormSms;

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/SmsTemplateForm/SmsTemplateForm');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

const templateDTO = {
  id: 'template-id',
  templateType: 'SMS',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'name',
  message: 'message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
} satisfies TemplateDto;

describe('EditSmsTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect to invalid-template when no templateId is found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await EditSmsTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should redirect to invalid-template when template type is not SMS', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...templateDTO,
      templateType: 'NHS_APP',
    });

    await EditSmsTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should render CreateSmsTemplate component when templateId is found', async () => {
    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const smsTemplate: SMSTemplate = {
      ...templateDTO,
      templateType: 'SMS',
      templateStatus: 'NOT_YET_SUBMITTED',
    };

    const page = await EditSmsTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(await generateMetadata()).toEqual({ title: editPageTitle });
    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(page).toEqual(
      <NHSNotifyContainer>
        <SmsTemplateForm initialState={smsTemplate} />
      </NHSNotifyContainer>
    );
  });
});

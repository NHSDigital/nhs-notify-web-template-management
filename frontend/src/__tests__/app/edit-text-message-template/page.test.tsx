/**
 * @jest-environment node
 */
import EditSmsTemplatePage from '@app/edit-text-message-template/[templateId]/page';
import { getTemplate } from '@utils/form-actions';
import {
  SMSTemplate,
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { SmsTemplateForm } from '@forms/SmsTemplateForm/SmsTemplateForm';
import { TemplateDTO } from 'nhs-notify-backend-client';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/SmsTemplateForm/SmsTemplateForm');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

const templateDTO: TemplateDTO = {
  id: 'template-id',
  templateType: TemplateType.SMS,
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: 'name',
  message: 'message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
};

describe('EditSmsTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect to invalid-template when no templateId is found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await EditSmsTemplatePage({ params: { templateId: 'template-id' } });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should redirect to invalid-template when template type is not SMS', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...templateDTO,
      templateType: TemplateType.NHS_APP,
    });

    await EditSmsTemplatePage({ params: { templateId: 'template-id' } });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should render CreateSmsTemplate component when templateId is found', async () => {
    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const smsTemplate: SMSTemplate = {
      ...templateDTO,
      templateType: TemplateType.SMS,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    }

    const page = await EditSmsTemplatePage({
      params: { templateId: 'template-id' },
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(page).toEqual(<SmsTemplateForm initialState={smsTemplate} />);
  });
});

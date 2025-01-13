/**
 * @jest-environment node
 */
import EditEmailTemplatePage from '@app/edit-email-template/[templateId]/page';
import { getTemplate } from '@utils/form-actions';
import {
  EmailTemplate,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { EmailTemplateForm } from '@forms/EmailTemplateForm/EmailTemplateForm';
import { TemplateDTO } from 'nhs-notify-backend-client';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/EmailTemplateForm/EmailTemplateForm');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

const templateDTO: TemplateDTO = {
  id: 'template-id',
  templateType: TemplateType.EMAIL,
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: 'name',
  subject: 'subject',
  message: 'message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
};

describe('EditEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect to invalid-template when no template is found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await EditEmailTemplatePage({ params: { templateId: 'template-id' } });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should redirect to invalid-template when template type is not EMAIL', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...templateDTO,
      templateType: TemplateType.NHS_APP,
    });

    await EditEmailTemplatePage({ params: { templateId: 'template-id' } });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should render CreateEmailTemplatePage component when template is found', async () => {
    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const emailTemplate: EmailTemplate = {
      ...templateDTO,
      subject: 'subject',
      templateType: TemplateType.EMAIL,
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    };

    const page = await EditEmailTemplatePage({
      params: { templateId: 'template-id' },
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(page).toEqual(<EmailTemplateForm initialState={emailTemplate} />);
  });
});

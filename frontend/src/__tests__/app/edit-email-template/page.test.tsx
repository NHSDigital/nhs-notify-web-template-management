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

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/EmailTemplateForm/EmailTemplateForm');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

const initialState: EmailTemplate = {
  id: 'template-id',
  version: 1,
  templateType: TemplateType.EMAIL,
  templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
  name: 'name',
  subject: 'subject',
  message: 'message',
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
      ...initialState,
      templateType: TemplateType.NHS_APP,
    });

    await EditEmailTemplatePage({ params: { templateId: 'template-id' } });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should render CreateEmailTemplatePage component when template is found', async () => {
    getTemplateMock.mockResolvedValueOnce(initialState);

    const page = await EditEmailTemplatePage({
      params: { templateId: 'template-id' },
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(page).toEqual(<EmailTemplateForm initialState={initialState} />);
  });
});

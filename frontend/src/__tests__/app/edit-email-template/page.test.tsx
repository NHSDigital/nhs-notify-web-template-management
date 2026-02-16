/**
 * @jest-environment node
 */
import EditEmailTemplatePage, {
  generateMetadata,
} from '@app/edit-email-template/[templateId]/page';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { EmailTemplateForm } from '@forms/EmailTemplateForm/EmailTemplateForm';
import { EmailTemplate } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyContainer } from '@layouts/container/container';
import content from '@content/content';

const { editPageTitle } = content.components.templateFormEmail;

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/EmailTemplateForm/EmailTemplateForm');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

const template: EmailTemplate = {
  id: 'template-id',
  templateType: 'EMAIL',
  templateStatus: 'NOT_YET_SUBMITTED',
  name: 'name',
  subject: 'subject',
  message: 'message',
  createdAt: '2025-01-13T10:19:25.579Z',
  updatedAt: '2025-01-13T10:19:25.579Z',
  lockNumber: 1,
};

describe('EditEmailTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should redirect to invalid-template when no template is found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await EditEmailTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should redirect to invalid-template when template type is not EMAIL', async () => {
    getTemplateMock.mockResolvedValueOnce({
      ...template,
      templateType: 'NHS_APP',
    });

    await EditEmailTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should render CreateEmailTemplatePage component when template is found', async () => {
    getTemplateMock.mockResolvedValueOnce(template);

    const emailTemplate: EmailTemplate = {
      ...template,
      subject: 'subject',
      templateType: 'EMAIL' as const,
      templateStatus: 'NOT_YET_SUBMITTED',
    };

    const page = await EditEmailTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(await generateMetadata()).toEqual({ title: editPageTitle });
    expect(getTemplateMock).toHaveBeenCalledWith('template-id');

    expect(page).toEqual(
      <NHSNotifyContainer>
        <EmailTemplateForm initialState={emailTemplate} />
      </NHSNotifyContainer>
    );
  });
});

/**
 * @jest-environment node
 */
import { redirect } from 'next/navigation';
import { NHSAppTemplate } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { NhsAppTemplateForm } from '@forms/NhsAppTemplateForm/NhsAppTemplateForm';
import EditNhsAppTemplatePage, {
  generateMetadata,
} from '@app/edit-nhs-app-template/[templateId]/page';
import { TemplateDto } from 'nhs-notify-backend-client';
import { EMAIL_TEMPLATE, LETTER_TEMPLATE, SMS_TEMPLATE } from '../../helpers';

jest.mock('@forms/NhsAppTemplateForm/NhsAppTemplateForm');
jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const getTemplateMock = jest.mocked(getTemplate);
const redirectMock = jest.mocked(redirect);

describe('EditNhsAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  test('page loads', async () => {
    generateMetadata();
    const template = {
      id: 'template-id',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'name',
      message: 'message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDto;

    const nhsAppTemplate: NHSAppTemplate = {
      ...template,
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
    };

    getTemplateMock.mockResolvedValueOnce(template);

    const page = await EditNhsAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(<NhsAppTemplateForm initialState={nhsAppTemplate} />);
  });

  test('should render invalid template, when template is not found', async () => {
    getTemplateMock.mockResolvedValueOnce(undefined);

    await EditNhsAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([EMAIL_TEMPLATE, SMS_TEMPLATE, LETTER_TEMPLATE])(
    'should render invalid template, when template type is $templateType',
    async (template) => {
      getTemplateMock.mockResolvedValueOnce(template);

      await EditNhsAppTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});

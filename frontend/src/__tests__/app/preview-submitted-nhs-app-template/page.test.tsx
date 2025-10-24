/**
 * @jest-environment node
 */
import PreviewSubmittedNHSAppTemplatePage, {
  generateMetadata,
} from '@app/preview-submitted-nhs-app-template/[templateId]/page';
import { ViewNHSAppTemplate } from '@molecules/ViewNHSAppTemplate/ViewNHSAppTemplate';
import { NHSAppTemplate } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { TemplateDto } from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import content from '@content/content';

const { pageTitle } = content.components.previewNHSAppTemplate;

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('PreviewSubmittedNHSAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const templateDTO = {
      id: 'template-id',
      templateType: 'NHS_APP',
      templateStatus: 'SUBMITTED',
      name: 'template-name',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
      lockNumber: 1,
    } satisfies TemplateDto;

    const submittedNHSAppTemplate: NHSAppTemplate = {
      ...templateDTO,
      templateType: 'NHS_APP',
      templateStatus: 'SUBMITTED',
    };

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await PreviewSubmittedNHSAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(await generateMetadata()).toEqual({
      title: pageTitle,
    });
    expect(page).toEqual(
      <ViewNHSAppTemplate initialState={submittedNHSAppTemplate} />
    );
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await PreviewSubmittedNHSAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      ...EMAIL_TEMPLATE,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...SMS_TEMPLATE,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...NHS_APP_TEMPLATE,
      message: undefined as unknown as string,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...NHS_APP_TEMPLATE,
      name: undefined as unknown as string,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...NHS_APP_TEMPLATE,
      name: null as unknown as string,
      message: null as unknown as string,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...NHS_APP_TEMPLATE,
      name: null as unknown as string,
      message: null as unknown as string,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...NHS_APP_TEMPLATE,
      name: 'template-name',
      message: 'template-message',
      templateStatus: 'NOT_YET_SUBMITTED' as const,
    },
  ])(
    'should redirect to invalid-template when template is $templateType, name is $name, message is $message, and status is $templateStatus',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await PreviewSubmittedNHSAppTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});

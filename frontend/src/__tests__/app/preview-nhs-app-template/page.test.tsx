/**
 * @jest-environment node
 */
import PreviewNhsAppTemplatePage, {
  generateMetadata,
} from '@app/preview-nhs-app-template/[templateId]/page';
import { PreviewNHSAppTemplate } from '@forms/PreviewNHSAppTemplate/PreviewNHSAppTemplate';
import { NHSAppTemplate } from 'nhs-notify-web-template-management-utils';
import { NHSNotifyContainer } from '@layouts/container/container';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-web-template-management-types';
import {
  EMAIL_TEMPLATE,
  PDF_LETTER_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import content from '@content/content';

const { pageTitle } = content.components.previewNHSAppTemplate;

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/PreviewNHSAppTemplate/PreviewNHSAppTemplate');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('PreviewNhsAppTemplatePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should load page', async () => {
    const templateDTO = {
      id: 'template-id',
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
      name: 'template-name',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
      lockNumber: 1,
    } satisfies TemplateDto;

    const nhsAppTemplate: NHSAppTemplate = {
      ...templateDTO,
      templateType: 'NHS_APP',
      templateStatus: 'NOT_YET_SUBMITTED',
    };

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await PreviewNhsAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(await generateMetadata()).toEqual({
      title: pageTitle,
    });
    expect(page).toEqual(
      <NHSNotifyContainer>
        <PreviewNHSAppTemplate initialState={nhsAppTemplate} />
      </NHSNotifyContainer>
    );
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await PreviewNhsAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    EMAIL_TEMPLATE,
    SMS_TEMPLATE,
    PDF_LETTER_TEMPLATE,
    {
      ...NHS_APP_TEMPLATE,
      message: undefined as unknown as string,
    },
    {
      ...NHS_APP_TEMPLATE,
      name: undefined as unknown as string,
    },
    {
      ...NHS_APP_TEMPLATE,
      name: null as unknown as string,
      message: null as unknown as string,
    },
  ])(
    'should redirect to invalid-template when template is $templateType and name is $nhsAppTemplateName and message is $nhsAppTemplateMessage',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await PreviewNhsAppTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});

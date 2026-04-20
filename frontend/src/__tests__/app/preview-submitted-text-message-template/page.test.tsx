import PreviewSubmittedSMSTemplatePage, {
  generateMetadata,
} from '@app/preview-submitted-text-message-template/[templateId]/page';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import { TemplateDto } from 'nhs-notify-web-template-management-types';
import {
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '@testhelpers/helpers';
import content from '@content/content';
import { render } from '@testing-library/react';
import {
  useFeatureFlags,
  useCampaignIds,
} from '@providers/client-config-provider';

const { pageTitle } = content.components.previewSMSTemplate;

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@providers/client-config-provider');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('PreviewSubmittedSMSTemplatePage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(useFeatureFlags).mockReturnValue({ routing: false });
    jest.mocked(useCampaignIds).mockReturnValue(['campaign-1', 'campaign-2']);
  });

  it('should render full page', async () => {
    const templateDTO = {
      id: 'template-id',
      templateType: 'SMS',
      templateStatus: 'SUBMITTED',
      name: 'template-name',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
      lockNumber: 1,
    } satisfies TemplateDto;

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await PreviewSubmittedSMSTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(await generateMetadata()).toEqual({
      title: pageTitle,
    });

    const { asFragment } = render(page);

    expect(asFragment()).toMatchSnapshot();
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await PreviewSubmittedSMSTemplatePage({
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
      ...NHS_APP_TEMPLATE,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...SMS_TEMPLATE,
      message: undefined as unknown as string,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...SMS_TEMPLATE,
      name: undefined as unknown as string,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...SMS_TEMPLATE,
      name: null as unknown as string,
      message: null as unknown as string,
      templateStatus: 'SUBMITTED' as const,
    },
    {
      ...SMS_TEMPLATE,
      templateStatus: 'NOT_YET_SUBMITTED' as const,
    },
  ])(
    'should redirect to invalid-template when template is $templateType, name is $name, message is $message, and status is $templateStatus',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await PreviewSubmittedSMSTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});

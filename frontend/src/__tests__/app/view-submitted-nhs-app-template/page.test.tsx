/**
 * @jest-environment node
 */
import ViewSubmittedNHSAppTemplatePage from '@app/view-submitted-nhs-app-template/[templateId]/page';
import { ViewNHSAppTemplate } from '@molecules/ViewNHSAppTemplate/ViewNHSAppTemplate';
import { NHSAppTemplate } from 'nhs-notify-web-template-management-utils';
import { getTemplate } from '@utils/form-actions';
import { redirect } from 'next/navigation';
import {
  TemplateDTO,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';
import {
  EMAIL_TEMPLATE,
  NHS_APP_TEMPLATE,
  SMS_TEMPLATE,
} from '../../helpers';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('ViewSubmittedNHSAppTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  it('should load page', async () => {
    const templateDTO = {
      id: 'template-id',
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.SUBMITTED,
      name: 'template-name',
      message: 'template-message',
      createdAt: '2025-01-13T10:19:25.579Z',
      updatedAt: '2025-01-13T10:19:25.579Z',
    } satisfies TemplateDTO;

    const submittedNHSAppTemplate: NHSAppTemplate = {
      ...templateDTO,
      templateType: TemplateType.NHS_APP,
      templateStatus: TemplateStatus.SUBMITTED,
    };

    getTemplateMock.mockResolvedValueOnce(templateDTO);

    const page = await ViewSubmittedNHSAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(
      <ViewNHSAppTemplate initialState={submittedNHSAppTemplate} />
    );
  });

  it('should redirect to invalid-template when no template is found', async () => {
    await ViewSubmittedNHSAppTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  test.each([
    {
      ...EMAIL_TEMPLATE,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      ...SMS_TEMPLATE,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      ...NHS_APP_TEMPLATE,
      message: undefined as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      ...NHS_APP_TEMPLATE,
      name: undefined as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      ...NHS_APP_TEMPLATE,
      name: null as unknown as string,
      message: null as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      ...NHS_APP_TEMPLATE,
      name: null as unknown as string,
      message: null as unknown as string,
      templateStatus: TemplateStatus.SUBMITTED,
    },
    {
      ...NHS_APP_TEMPLATE,
      name: 'template-name',
      message: 'template-message',
      templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    },
  ])(
    'should redirect to invalid-template when template is $templateType, name is $name, message is $message, and status is $templateStatus',
    async (value) => {
      getTemplateMock.mockResolvedValueOnce(value);

      await ViewSubmittedNHSAppTemplatePage({
        params: Promise.resolve({
          templateId: 'template-id',
        }),
      });

      expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
    }
  );
});

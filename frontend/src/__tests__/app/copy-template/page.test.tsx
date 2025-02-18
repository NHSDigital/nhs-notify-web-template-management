/**
 * @jest-environment node
 */
import CopyTemplatePage from '@app/copy-template/[templateId]/page';
import { CopyTemplate } from '@forms/CopyTemplate/CopyTemplate';
import {
  TemplateType,
  TemplateStatus,
} from 'nhs-notify-web-template-management-utils';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { TemplateDTO } from 'nhs-notify-backend-client';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/ChooseTemplate/ChooseTemplate');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('CopyTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  const template: TemplateDTO = {
    id: 'template-id',
    templateType: TemplateType.EMAIL,
    templateStatus: TemplateStatus.NOT_YET_SUBMITTED,
    name: 'template-name',
    subject: 'template-subject-line',
    message: 'template-message',
    createdAt: '2025-01-13T10:19:25.579Z',
    updatedAt: '2025-01-13T10:19:25.579Z',
  };

  it('should load page', async () => {
    getTemplateMock.mockResolvedValueOnce(template);

    const page = await CopyTemplatePage({
      params: {
        templateId: 'template-id',
      },
    });

    expect(page).toEqual(
      <CopyTemplate
        template={template}
        templateTypes={Object.values(TemplateType)}
      />
    );
  });

  it('Letter option is hidden when the feature flag is not enabled', async () => {
    delete process.env.ENABLE_LETTERS;

    getTemplateMock.mockResolvedValueOnce(template);

    const page = await CopyTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(
      <CopyTemplate
        template={template}
        templateTypes={[
          TemplateType.NHS_APP,
          TemplateType.EMAIL,
          TemplateType.SMS,
        ]}
      />
    );
  });

  it('should redirect to invalid-template when no templateId is found', async () => {
    await CopyTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });
});

/**
 * @jest-environment node
 */
import CopyTemplatePage from '@app/copy-template/[templateId]/page';
import { CopyTemplate } from '@forms/CopyTemplate/CopyTemplate';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import { TemplateDto } from 'nhs-notify-backend-client';
import { PdfLetterTemplate } from 'nhs-notify-web-template-management-utils';

jest.mock('@utils/form-actions');
jest.mock('next/navigation');
jest.mock('@forms/ChooseTemplateType/ChooseTemplateType');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

describe('CopyTemplatePage', () => {
  beforeEach(jest.resetAllMocks);

  const template = {
    id: 'template-id',
    templateType: 'EMAIL',
    templateStatus: 'NOT_YET_SUBMITTED',
    name: 'template-name',
    subject: 'template-subject-line',
    message: 'template-message',
    createdAt: '2025-01-13T10:19:25.579Z',
    updatedAt: '2025-01-13T10:19:25.579Z',
    lockNumber: 1,
  } satisfies TemplateDto;

  const letterTemplate: PdfLetterTemplate = {
    id: 'template-id',
    templateType: 'LETTER',
    templateStatus: 'NOT_YET_SUBMITTED',
    name: 'template-name',
    createdAt: '2025-01-13T10:19:25.579Z',
    updatedAt: '2025-01-13T10:19:25.579Z',
    lockNumber: 1,
    letterType: 'q4',
    language: 'fr',
    letterVersion: 'PDF',
    files: {
      pdfTemplate: {
        fileName: 'file.pdf',
        currentVersion: '61C1267A-0F37-4E1D-831E-494DE2BECC8C',
        virusScanStatus: 'PASSED',
      },
      testDataCsv: {
        fileName: 'file.csv',
        currentVersion: 'A8A76934-70F4-4735-8314-51CE097130DB',
        virusScanStatus: 'PASSED',
      },
    },
  };

  it('should load page', async () => {
    getTemplateMock.mockResolvedValueOnce(template);

    const page = await CopyTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(page).toEqual(<CopyTemplate template={template} />);
  });

  it('should redirect to invalid-template when no templateId is found', async () => {
    await CopyTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should redirect to invalid-template when the template is a letter', async () => {
    getTemplateMock.mockResolvedValueOnce(letterTemplate);

    await CopyTemplatePage({
      params: Promise.resolve({
        templateId: 'template-id',
      }),
    });

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });
});

/**
 * @jest-environment node
 */
import { TemplateDto } from 'nhs-notify-web-template-management-types';
import { submitAuthoringLetterAction } from '@app/preview-letter-template/[templateId]/server-action';
import { redirect } from 'next/navigation';
import { getTemplate } from '@utils/form-actions';
import {
  AUTHORING_LETTER_TEMPLATE,
  getMockFormData,
} from '@testhelpers/helpers';
import content from '@content/content';

jest.mock('next/navigation');
jest.mock('@utils/form-actions');

const redirectMock = jest.mocked(redirect);
const getTemplateMock = jest.mocked(getTemplate);

const { approveErrors } = content.pages.previewLetterTemplate;

const TEMPLATE_WITH_BOTH_RENDERS = {
  ...AUTHORING_LETTER_TEMPLATE,
  files: {
    ...AUTHORING_LETTER_TEMPLATE.files,
    shortFormRender: {
      status: 'RENDERED' as const,
      fileName: 'short.pdf',
      currentVersion: 'v1',
      pageCount: 2,
    },
    longFormRender: {
      status: 'RENDERED' as const,
      fileName: 'long.pdf',
      currentVersion: 'v1',
      pageCount: 2,
    },
  },
};

describe('submitAuthoringLetterAction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    getTemplateMock.mockResolvedValue(TEMPLATE_WITH_BOTH_RENDERS);
  });

  it('should redirect to get-ready-to-approve-letter-template page with valid form data', async () => {
    const formData = new FormData();
    formData.append('templateId', AUTHORING_LETTER_TEMPLATE.id);
    formData.append('lockNumber', '1');

    await submitAuthoringLetterAction({}, formData);

    expect(redirectMock).toHaveBeenCalledWith(
      `/get-ready-to-approve-letter-template/${AUTHORING_LETTER_TEMPLATE.id}?lockNumber=1`
    );
  });

  it('should return error state when templateId is missing', async () => {
    const formData = new FormData();
    formData.append('lockNumber', '1');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toHaveProperty('errorState');
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error state when lockNumber is missing', async () => {
    const formData = new FormData();
    formData.append('templateId', AUTHORING_LETTER_TEMPLATE.id);

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toHaveProperty('errorState');
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error state when lockNumber is invalid', async () => {
    const formData = new FormData();
    formData.append('templateId', AUTHORING_LETTER_TEMPLATE.id);
    formData.append('lockNumber', 'not-a-number');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toHaveProperty('errorState');
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error state when templateId is empty', async () => {
    const formData = new FormData();
    formData.append('templateId', '');
    formData.append('lockNumber', '1');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toHaveProperty('errorState');
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should redirect to invalid-template page when template validation fails', async () => {
    getTemplateMock.mockResolvedValueOnce({
      id: 'template-id',
    } as unknown as TemplateDto);

    const formData = getMockFormData({
      templateId: '992fe769-f8b3-43a9-84f1-6e10d0480bb6',
      lockNumber: '300',
    });

    await submitAuthoringLetterAction({}, formData);

    expect(redirectMock).toHaveBeenCalledWith('/invalid-template', 'replace');
  });

  it('should return error when short example has not been generated', async () => {
    getTemplateMock.mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      files: {
        ...AUTHORING_LETTER_TEMPLATE.files,
        shortFormRender: undefined,
        longFormRender: {
          status: 'RENDERED' as const,
          fileName: 'long.pdf',
          currentVersion: 'v1',
          pageCount: 2,
        },
      },
    });

    const formData = new FormData();
    formData.append('templateId', AUTHORING_LETTER_TEMPLATE.id);
    formData.append('lockNumber', '1');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result.errorState?.fieldErrors?.['tab-short']).toContain(
      approveErrors.shortExampleRequired
    );
    expect(result.errorState?.fieldErrors?.['tab-long']).toBeUndefined();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error when long example has not been generated', async () => {
    getTemplateMock.mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      files: {
        ...AUTHORING_LETTER_TEMPLATE.files,
        shortFormRender: {
          status: 'RENDERED' as const,
          fileName: 'short.pdf',
          currentVersion: 'v1',
          pageCount: 2,
        },
        longFormRender: undefined,
      },
    });

    const formData = new FormData();
    formData.append('templateId', AUTHORING_LETTER_TEMPLATE.id);
    formData.append('lockNumber', '1');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result.errorState?.fieldErrors?.['tab-long']).toContain(
      approveErrors.longExampleRequired
    );
    expect(result.errorState?.fieldErrors?.['tab-short']).toBeUndefined();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return errors for both missing examples', async () => {
    getTemplateMock.mockResolvedValue(AUTHORING_LETTER_TEMPLATE);

    const formData = new FormData();
    formData.append('templateId', AUTHORING_LETTER_TEMPLATE.id);
    formData.append('lockNumber', '1');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result.errorState?.fieldErrors?.['tab-short']).toContain(
      approveErrors.shortExampleRequired
    );
    expect(result.errorState?.fieldErrors?.['tab-long']).toContain(
      approveErrors.longExampleRequired
    );
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error when short render exists but is not RENDERED status', async () => {
    getTemplateMock.mockResolvedValue({
      ...AUTHORING_LETTER_TEMPLATE,
      files: {
        ...AUTHORING_LETTER_TEMPLATE.files,
        shortFormRender: { status: 'FAILED' as const },
        longFormRender: {
          status: 'RENDERED' as const,
          fileName: 'long.pdf',
          currentVersion: 'v1',
          pageCount: 2,
        },
      },
    });

    const formData = new FormData();
    formData.append('templateId', AUTHORING_LETTER_TEMPLATE.id);
    formData.append('lockNumber', '1');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result.errorState?.fieldErrors?.['tab-short']).toContain(
      approveErrors.shortExampleRequired
    );
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

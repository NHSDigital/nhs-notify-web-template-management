/**
 * @jest-environment node
 */
import { submitAuthoringLetterAction } from '@app/preview-letter-template/[templateId]/server-action';
import { redirect } from 'next/navigation';
import { AUTHORING_LETTER_TEMPLATE } from '@testhelpers/helpers';
import content from '@content/content';

jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);

const { approveErrors } = content.pages.previewLetterTemplate;

describe('submitAuthoringLetterAction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should redirect to get-ready-to-approve-letter-template page with valid form data', async () => {
    const formData = new FormData();
    formData.append('templateId', AUTHORING_LETTER_TEMPLATE.id);
    formData.append('lockNumber', '1');
    formData.append('shortFormRenderStatus', 'RENDERED');
    formData.append('longFormRenderStatus', 'RENDERED');

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

  it('should return error when short example has not been generated', async () => {
    const formData = new FormData();
    formData.append('templateId', AUTHORING_LETTER_TEMPLATE.id);
    formData.append('lockNumber', '1');
    formData.append('shortFormRenderStatus', '');
    formData.append('longFormRenderStatus', 'RENDERED');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result.errorState?.fieldErrors?.['tab-short']).toContain(
      approveErrors.shortExampleRequired
    );
    expect(result.errorState?.fieldErrors?.['tab-long']).toBeUndefined();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error when long example has not been generated', async () => {
    const formData = new FormData();
    formData.append('templateId', AUTHORING_LETTER_TEMPLATE.id);
    formData.append('lockNumber', '1');
    formData.append('shortFormRenderStatus', 'RENDERED');
    formData.append('longFormRenderStatus', '');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result.errorState?.fieldErrors?.['tab-long']).toContain(
      approveErrors.longExampleRequired
    );
    expect(result.errorState?.fieldErrors?.['tab-short']).toBeUndefined();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return errors for both missing examples', async () => {
    const formData = new FormData();
    formData.append('templateId', AUTHORING_LETTER_TEMPLATE.id);
    formData.append('lockNumber', '1');
    formData.append('shortFormRenderStatus', '');
    formData.append('longFormRenderStatus', '');

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
    const formData = new FormData();
    formData.append('templateId', AUTHORING_LETTER_TEMPLATE.id);
    formData.append('lockNumber', '1');
    formData.append('shortFormRenderStatus', 'FAILED');
    formData.append('longFormRenderStatus', 'RENDERED');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result.errorState?.fieldErrors?.['tab-short']).toContain(
      approveErrors.shortExampleRequired
    );
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error when long render exists but is not RENDERED status', async () => {
    const formData = new FormData();
    formData.append('templateId', AUTHORING_LETTER_TEMPLATE.id);
    formData.append('lockNumber', '1');
    formData.append('shortFormRenderStatus', 'RENDERED');
    formData.append('longFormRenderStatus', 'FAILED');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result.errorState?.fieldErrors?.['tab-long']).toContain(
      approveErrors.longExampleRequired
    );
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

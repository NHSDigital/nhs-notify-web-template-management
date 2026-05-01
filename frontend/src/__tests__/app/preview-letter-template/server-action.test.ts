/**
 * @jest-environment node
 */
import { submitAuthoringLetterAction } from '@app/preview-letter-template/[templateId]/server-action';
import { $FormSchema } from '@app/preview-letter-template/[templateId]/server-action-form-schema';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { AUTHORING_LETTER_TEMPLATE } from '@testhelpers/helpers';
import content from '@content/content';
import { ErrorCodes } from '@utils/error-codes';

jest.mock('next/navigation');

const redirectMock = jest.mocked(redirect);

const { approveErrors } = content.pages.previewLetterTemplate;

type FormSchema = z.infer<typeof $FormSchema>;

const generateTestFormData = ({
  templateId,
  lockNumber,
  shortFormRenderStatus,
  longFormRenderStatus,
  letterVariantId,
  letterVariantBothSidesFlag,
  templatePageCount,
  shortRenderPageCount,
  longRenderPageCount,
  letterVariantMaxSheets,
}: Partial<FormSchema> = {}) => {
  const formData = new FormData();

  formData.append('templateId', templateId ?? AUTHORING_LETTER_TEMPLATE.id);
  formData.append('lockNumber', lockNumber?.toString() ?? '1');
  formData.append('shortFormRenderStatus', shortFormRenderStatus ?? 'RENDERED');
  formData.append('longFormRenderStatus', longFormRenderStatus ?? 'RENDERED');
  formData.append('letterVariantId', letterVariantId ?? 'letter-variant-id');
  formData.append(
    'letterVariantBothSidesFlag',
    letterVariantBothSidesFlag ? '1' : '0'
  );
  formData.append('templatePageCount', templatePageCount?.toString() ?? '2');
  formData.append(
    'shortRenderPageCount',
    shortRenderPageCount?.toString() ?? '2'
  );
  formData.append(
    'longRenderPageCount',
    longRenderPageCount?.toString() ?? '2'
  );
  formData.append(
    'letterVariantMaxSheets',
    letterVariantMaxSheets?.toString() ?? '10'
  );

  return formData;
};

describe('submitAuthoringLetterAction', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should redirect to get-ready-to-approve-letter-template page with valid form data', async () => {
    const formData = generateTestFormData();

    await submitAuthoringLetterAction({}, formData);

    expect(redirectMock).toHaveBeenCalledWith(
      `/get-ready-to-approve-letter-template/${AUTHORING_LETTER_TEMPLATE.id}?lockNumber=1`
    );
  });

  it('should return error state when templateId is missing', async () => {
    const formData = generateTestFormData();
    formData.delete('templateId');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          templateId: ['Invalid input: expected string, received undefined'],
        },
        formErrors: [],
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error state when lockNumber is missing', async () => {
    const formData = generateTestFormData();
    formData.delete('lockNumber');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          lockNumber: ['Invalid input: expected number, received NaN'],
        },
        formErrors: [],
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error state when lockNumber is invalid', async () => {
    const formData = generateTestFormData();
    formData.delete('lockNumber');
    formData.append('lockNumber', 'not-a-number');

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          lockNumber: ['Invalid input: expected number, received NaN'],
        },
        formErrors: [],
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error state when templateId is empty', async () => {
    const formData = generateTestFormData({ templateId: '' });

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          templateId: ['Too small: expected string to have >=1 characters'],
        },
        formErrors: [],
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error when short example has not been generated', async () => {
    const formData = generateTestFormData({ shortFormRenderStatus: '' });

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          'tab-short': [approveErrors.shortExampleRequired],
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error when long example has not been generated', async () => {
    const formData = generateTestFormData({ longFormRenderStatus: '' });

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          'tab-long': [approveErrors.longExampleRequired],
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return errors for both missing examples', async () => {
    const formData = generateTestFormData({
      shortFormRenderStatus: '',
      longFormRenderStatus: '',
    });

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          'tab-short': [approveErrors.shortExampleRequired],
          'tab-long': [approveErrors.longExampleRequired],
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error when short render exists but is not RENDERED status', async () => {
    const formData = generateTestFormData({ shortFormRenderStatus: 'FAILED' });

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          'tab-short': [approveErrors.shortExampleRequired],
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error when long render exists but is not RENDERED status', async () => {
    const formData = generateTestFormData({ longFormRenderStatus: 'FAILED' });

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          'tab-long': [approveErrors.longExampleRequired],
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error when short render page count exceeds max sheets (both sides)', async () => {
    const formData = generateTestFormData({
      shortRenderPageCount: 12,
      letterVariantBothSidesFlag: true,
      letterVariantMaxSheets: 5,
    });

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          'printing-and-postage': [
            ErrorCodes.SHORT_RENDER_CONTAINS_TOO_MANY_SHEETS,
          ],
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error when long render page count exceeds max sheets (both sides)', async () => {
    const formData = generateTestFormData({
      longRenderPageCount: 12,
      letterVariantBothSidesFlag: true,
      letterVariantMaxSheets: 5,
    });

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          'printing-and-postage': [
            ErrorCodes.LONG_RENDER_CONTAINS_TOO_MANY_SHEETS,
          ],
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error when template page count exceeds max sheets (one-sided)', async () => {
    const formData = generateTestFormData({
      templatePageCount: 6,
      letterVariantBothSidesFlag: false,
      letterVariantMaxSheets: 5,
    });

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          'printing-and-postage': [
            ErrorCodes.INITIAL_RENDER_CONTAINS_TOO_MANY_SHEETS,
          ],
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return error if letter variant ID is missing', async () => {
    const formData = generateTestFormData({
      letterVariantId: '',
    });

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          'printing-and-postage': ['Choose how to print and post this letter'],
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return only initial render error when template page count exceeds max sheets, even if personalised renders also exceed', async () => {
    const formData = generateTestFormData({
      templatePageCount: 12,
      shortRenderPageCount: 12,
      longRenderPageCount: 12,
      letterVariantBothSidesFlag: true,
      letterVariantMaxSheets: 5,
    });

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          'printing-and-postage': [
            ErrorCodes.INITIAL_RENDER_CONTAINS_TOO_MANY_SHEETS,
          ],
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it('should return short render page count error with one-sided printing', async () => {
    const formData = generateTestFormData({
      shortRenderPageCount: 6,
      letterVariantBothSidesFlag: false,
      letterVariantMaxSheets: 5,
    });

    const result = await submitAuthoringLetterAction({}, formData);

    expect(result).toEqual({
      errorState: {
        fieldErrors: {
          'printing-and-postage': [
            ErrorCodes.SHORT_RENDER_CONTAINS_TOO_MANY_SHEETS,
          ],
        },
      },
    });
    expect(redirectMock).not.toHaveBeenCalled();
  });
});

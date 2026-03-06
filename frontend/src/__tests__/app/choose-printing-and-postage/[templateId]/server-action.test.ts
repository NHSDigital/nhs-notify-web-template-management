import { redirect } from 'next/navigation';
import { NextRedirectError } from '@testhelpers/next-redirect';
import { patchTemplate } from '@utils/form-actions';
import { choosePrintingAndPostage } from '@app/choose-printing-and-postage/[templateId]/server-action';

jest.mock('next/navigation');
jest.mocked(redirect).mockImplementation((url) => {
  throw new NextRedirectError(url);
});

jest.mock('@utils/form-actions');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('choosePrintingAndPostage', () => {
  it('patches the template and redirects when all fields are valid', async () => {
    const formData = new FormData();
    formData.append('letterVariantId', 'variant-456');
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', '5');

    await expect(choosePrintingAndPostage({}, formData)).rejects.toMatchObject({
      message: 'NEXT_REDIRECT',
      url: '/preview-letter-template/template-123',
    });

    expect(patchTemplate).toHaveBeenCalledWith(
      'template-123',
      { letterVariantId: 'variant-456' },
      5
    );
  });

  it('returns validation error when letterVariantId is empty', async () => {
    const formData = new FormData();
    formData.append('letterVariantId', '');
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', '5');

    const result = await choosePrintingAndPostage({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        letterVariantId: ['Choose a printing and postage option'],
      },
    });
  });

  it('returns validation error when letterVariantId is missing', async () => {
    const formData = new FormData();
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', '5');

    const result = await choosePrintingAndPostage({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        letterVariantId: ['Choose a printing and postage option'],
      },
    });
  });

  it('returns validation error when templateId is missing', async () => {
    const formData = new FormData();
    formData.append('letterVariantId', 'variant-456');
    formData.append('lockNumber', '5');

    const result = await choosePrintingAndPostage({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        templateId: [expect.any(String)],
      },
    });
  });

  it('returns validation error when lockNumber is missing', async () => {
    const formData = new FormData();
    formData.append('letterVariantId', 'variant-456');
    formData.append('templateId', 'template-123');

    const result = await choosePrintingAndPostage({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        lockNumber: [expect.any(String)],
      },
    });
  });

  it('returns validation error when lockNumber is invalid', async () => {
    const formData = new FormData();
    formData.append('letterVariantId', 'variant-456');
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', 'invalid');

    const result = await choosePrintingAndPostage({}, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        lockNumber: [expect.any(String)],
      },
    });
  });
});

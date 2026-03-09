import { updateLetterPreview } from '@molecules/LetterRender/server-action';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import { generateLetterProof } from '@utils/form-actions';

jest.mock('@utils/form-actions');
const mockGenerateLetterProof = jest.mocked(generateLetterProof);

beforeEach(() => {
  jest.clearAllMocks();
  mockGenerateLetterProof.mockResolvedValue({} as Awaited<
    ReturnType<typeof generateLetterProof>
  >);
});

function buildValidFormData(
  overrides: Record<string, string> = {}
): FormData {
  const defaults: Record<string, string> = {
    systemPersonalisationPackId: 'short-1',
    templateId: 'template-123',
    lockNumber: '1',
    tab: 'shortFormRender',
  };

  const merged = { ...defaults, ...overrides };
  const formData = new FormData();

  for (const [key, value] of Object.entries(merged)) {
    formData.append(key, value);
  }

  return formData;
}

describe('updateLetterPreview', () => {
  it('returns updated fields when recipient is valid', async () => {
    const formState: FormState = {};

    const formData = buildValidFormData({
      '__personalisation__appointmentDate': '2025-01-15',
    });

    const result = await updateLetterPreview(formState, formData);

    expect(result).toEqual({
      fields: {
        systemPersonalisationPackId: 'short-1',
        __personalisation__appointmentDate: '2025-01-15',
        templateId: 'template-123',
        lockNumber: '1',
        tab: 'shortFormRender',
      },
    });
  });

  it('returns updated fields for long tab with valid recipient', async () => {
    const formState: FormState = {};

    const formData = buildValidFormData({
      systemPersonalisationPackId: 'long-1',
      tab: 'longFormRender',
    });

    const result = await updateLetterPreview(formState, formData);

    expect(result.fields?.systemPersonalisationPackId).toBe('long-1');
    expect(result.errorState).toBeUndefined();
  });

  it('handles multiple custom personalisation fields', async () => {
    const formState: FormState = {};

    const formData = buildValidFormData({
      '__personalisation__appointmentDate': '2025-01-15',
      '__personalisation__clinicName': 'Main Street Clinic',
    });

    const result = await updateLetterPreview(formState, formData);

    expect(result.fields).toEqual({
      systemPersonalisationPackId: 'short-1',
      __personalisation__appointmentDate: '2025-01-15',
      __personalisation__clinicName: 'Main Street Clinic',
      templateId: 'template-123',
      lockNumber: '1',
      tab: 'shortFormRender',
    });
    expect(result.errorState).toBeUndefined();
  });

  it('handles empty custom personalisation field values', async () => {
    const formState: FormState = {};

    const formData = buildValidFormData({
      '__personalisation__appointmentDate': '',
    });

    const result = await updateLetterPreview(formState, formData);

    expect(result.fields?.__personalisation__appointmentDate).toBe('');
    expect(result.errorState).toBeUndefined();
  });

  it('clears previous errorState on successful submission', async () => {
    const formState: FormState = {
      errorState: {
        formErrors: [],
        fieldErrors: {
          systemPersonalisationPackId: ['Previous error'],
        },
      },
    };

    const formData = buildValidFormData();

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState).toBeUndefined();
  });

  it('returns validation error when systemPersonalisationPackId is empty', async () => {
    const formState: FormState = {};

    const formData = buildValidFormData({
      systemPersonalisationPackId: '',
    });

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState?.fieldErrors).toHaveProperty(
      'systemPersonalisationPackId'
    );
    expect(result.fields?.systemPersonalisationPackId).toBe('');
  });

  it('returns validation error when systemPersonalisationPackId is missing', async () => {
    const formState: FormState = {};

    const formData = new FormData();
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', '1');
    formData.append('tab', 'shortFormRender');

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState?.fieldErrors).toHaveProperty(
      'systemPersonalisationPackId'
    );
  });

  it('returns validation error when systemPersonalisationPackId is invalid', async () => {
    const formState: FormState = {};

    const formData = buildValidFormData({
      systemPersonalisationPackId: 'invalid-recipient-id',
    });

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState?.fieldErrors).toHaveProperty(
      'systemPersonalisationPackId'
    );
    expect(result.fields?.systemPersonalisationPackId).toBe(
      'invalid-recipient-id'
    );
  });

  it('falls back to empty personalisation when recipient ID is not in the selected tab list', async () => {
    const formState: FormState = {};

    // 'long-1' is a valid EXAMPLE_RECIPIENT_ID but won't be found in
    // SHORT_EXAMPLE_RECIPIENTS when tab is 'shortFormRender', exercising the ?? {} branch.
    const formData = buildValidFormData({
      systemPersonalisationPackId: 'long-1',
      tab: 'shortFormRender',
    });

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState).toBeUndefined();

    // generateLetterProof should still be called — with empty system personalisation
    expect(mockGenerateLetterProof).toHaveBeenCalledWith(
      'template-123',
      1,
      expect.objectContaining({
        systemPersonalisationPackId: 'long-1',
        requestTypeVariant: 'short',
        personalisation: expect.objectContaining({
          date: expect.any(String),
        }),
      })
    );
  });

  it('preserves custom field values on validation error', async () => {
    const formState: FormState = {};

    const formData = buildValidFormData({
      systemPersonalisationPackId: '',
      '__personalisation__appointmentDate': '2025-01-15',
    });

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState).toBeDefined();
    expect(result.fields?.__personalisation__appointmentDate).toBe(
      '2025-01-15'
    );
  });
});

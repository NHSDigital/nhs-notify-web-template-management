import { updateLetterPreview } from '@molecules/LetterRender/server-action';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import { generateLetterProof } from '@utils/form-actions';
import { AUTHORING_LETTER_TEMPLATE } from '@testhelpers/helpers';

jest.mock('@utils/form-actions');

const mockGenerateLetterProof = jest.mocked(generateLetterProof);

beforeEach(() => {
  jest.clearAllMocks();
  mockGenerateLetterProof.mockResolvedValue(AUTHORING_LETTER_TEMPLATE);
});

function buildFormData(overrides: Record<string, string> = {}): FormData {
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
  it('returns updated fields when systemPersonalisationPackId is valid', async () => {
    const formData = buildFormData({
      'personalisation|appointmentDate': '2025-01-15',
    });

    const result = await updateLetterPreview({}, formData);

    expect(result).toEqual({
      fields: {
        systemPersonalisationPackId: 'short-1',
        'personalisation|appointmentDate': '2025-01-15',
        templateId: 'template-123',
        lockNumber: '1',
        tab: 'shortFormRender',
      },
    });
  });

  it('returns updated fields for long tab with valid systemPersonalisationPackId', async () => {
    const formData = buildFormData({
      systemPersonalisationPackId: 'long-1',
      tab: 'longFormRender',
    });

    const result = await updateLetterPreview({}, formData);

    expect(result.fields?.systemPersonalisationPackId).toBe('long-1');
    expect(result.errorState).toBeUndefined();
  });

  it('handles multiple custom personalisation fields', async () => {
    const formData = buildFormData({
      'personalisation|appointmentDate': '2025-01-15',
      'personalisation|clinicName': 'Town Centre Clinic',
    });

    const result = await updateLetterPreview({}, formData);

    expect(result.fields).toEqual({
      systemPersonalisationPackId: 'short-1',
      'personalisation|appointmentDate': '2025-01-15',
      'personalisation|clinicName': 'Town Centre Clinic',
      templateId: 'template-123',
      lockNumber: '1',
      tab: 'shortFormRender',
    });
    expect(result.errorState).toBeUndefined();
  });

  it('strips the personalisation prefix from custom fields before calling generateLetterProof', async () => {
    const formData = buildFormData({
      'personalisation|appointmentDate': '2025-01-15',
      'personalisation|clinicName': 'Town Centre Clinic',
    });

    await updateLetterPreview({}, formData);

    expect(mockGenerateLetterProof).toHaveBeenCalledWith(
      'template-123',
      1,
      expect.objectContaining({
        personalisation: expect.objectContaining({
          appointmentDate: '2025-01-15',
          clinicName: 'Town Centre Clinic',
        }),
      })
    );
  });

  it('handles empty custom personalisation field values', async () => {
    const formData = buildFormData({
      'personalisation|appointmentDate': '',
    });

    const result = await updateLetterPreview({}, formData);

    expect(result.fields?.['personalisation|appointmentDate']).toBe('');
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

    const formData = buildFormData();

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState).toBeUndefined();
  });

  it('returns validation error when systemPersonalisationPackId is empty', async () => {
    const formData = buildFormData({
      systemPersonalisationPackId: '',
    });

    const result = await updateLetterPreview({}, formData);

    expect(result.errorState?.fieldErrors).toHaveProperty(
      'systemPersonalisationPackId'
    );
    expect(result.fields?.systemPersonalisationPackId).toBe('');
  });

  it('returns validation error when systemPersonalisationPackId is missing', async () => {
    const formData = new FormData();
    formData.append('templateId', 'template-123');
    formData.append('lockNumber', '1');
    formData.append('tab', 'shortFormRender');

    const result = await updateLetterPreview({}, formData);

    expect(result.errorState?.fieldErrors).toHaveProperty(
      'systemPersonalisationPackId'
    );
  });

  it('returns validation error when systemPersonalisationPackId is invalid', async () => {
    const formData = buildFormData({
      systemPersonalisationPackId: 'invalid-recipient-id',
    });

    const result = await updateLetterPreview({}, formData);

    expect(result.errorState?.fieldErrors).toHaveProperty(
      'systemPersonalisationPackId'
    );
    expect(result.fields?.systemPersonalisationPackId).toBe(
      'invalid-recipient-id'
    );
  });

  it('falls back to empty personalisation when recipient ID is not in the selected tab list', async () => {
    const formData = buildFormData({
      systemPersonalisationPackId: 'long-1',
      tab: 'shortFormRender',
    });

    const result = await updateLetterPreview({}, formData);

    expect(result.errorState).toBeUndefined();

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
    const formData = buildFormData({
      systemPersonalisationPackId: '',
      'personalisation|appointmentDate': '2025-01-15',
    });

    const result = await updateLetterPreview({}, formData);

    expect(result.errorState).toBeDefined();
    expect(result.fields?.['personalisation|appointmentDate']).toBe(
      '2025-01-15'
    );
  });

  it('includes todays date in personalisation, formatted', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-11T14:30:00Z'));

    const formData = buildFormData();

    await updateLetterPreview({}, formData);

    expect(mockGenerateLetterProof).toHaveBeenCalledWith(
      'template-123',
      1,
      expect.objectContaining({
        personalisation: expect.objectContaining({
          date: '11 March 2026',
        }),
      })
    );

    jest.useRealTimers();
  });
});

import { updateLetterPreview } from '@molecules/LetterRender/server-action';
import type { FormState } from 'nhs-notify-web-template-management-utils';
import { generateLetterProof } from '@utils/form-actions';
import { AUTHORING_LETTER_TEMPLATE } from '@testhelpers/helpers';

jest.mock('@utils/form-actions');

const mockGenerateLetterProof = jest.mocked(generateLetterProof);

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-03-11T14:30:00Z'));
  mockGenerateLetterProof.mockResolvedValue(AUTHORING_LETTER_TEMPLATE);
});

afterEach(() => {
  jest.useRealTimers();
});

const templateId = '20f1dd29-89ab-430e-9f5e-8009cbc4ca6c';

function buildFormData(overrides: Record<string, string> = {}): FormData {
  const defaults: Record<string, string> = {
    systemPersonalisationPackId: 'short-1',
    templateId,
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
        templateId,
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
      templateId,
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
      templateId,
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
    formData.append('templateId', templateId);
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

  it('returns validation error when systemPersonalisationPackId is not in the selected tab list', async () => {
    const formData = buildFormData({
      systemPersonalisationPackId: 'long-1',
      tab: 'shortFormRender',
    });

    const result = await updateLetterPreview({}, formData);

    expect(result.errorState?.fieldErrors).toHaveProperty(
      'systemPersonalisationPackId'
    );
    expect(result.fields?.systemPersonalisationPackId).toBe('long-1');
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

  it('merges system personalisation from the short tab recipient into the request', async () => {
    const formData = buildFormData({
      'personalisation|appointmentDate': '2025-01-15',
    });

    await updateLetterPreview({}, formData);

    expect(mockGenerateLetterProof).toHaveBeenCalledWith(templateId, 1, {
      systemPersonalisationPackId: 'short-1',
      requestTypeVariant: 'short',
      personalisation: {
        appointmentDate: '2025-01-15',
        nhsNumber: '9728543751',
        firstName: 'Jo',
        lastName: 'Bloggs',
        fullName: 'Jo Bloggs',
        middleNames: '',
        namePrefix: '',
        nameSuffix: '',
        address_line_1: 'Jo Bloggs',
        address_line_2: '1 High Street',
        address_line_3: 'Leeds',
        address_line_4: 'West Yorkshire',
        address_line_5: 'LS1 1AA',
        address_line_6: '',
        address_line_7: '',
        date: '11 March 2026',
      },
    });
  });

  it('merges system personalisation from the long tab recipient into the request', async () => {
    const formData = buildFormData({
      systemPersonalisationPackId: 'long-1',
      tab: 'longFormRender',
      'personalisation|clinicName': 'Town Centre Clinic',
    });

    await updateLetterPreview({}, formData);

    expect(mockGenerateLetterProof).toHaveBeenCalledWith(templateId, 1, {
      systemPersonalisationPackId: 'long-1',
      requestTypeVariant: 'long',
      personalisation: {
        clinicName: 'Town Centre Clinic',
        nhsNumber: '9728543771',
        firstName: 'Michael',
        lastName: 'Richardson-Clarke',
        fullName: 'Mr Michael James Richardson-Clarke',
        middleNames: 'James',
        namePrefix: 'Mr',
        nameSuffix: '',
        address_line_1: 'Mr Michael James Richardson-Clarke',
        address_line_2: 'Apartment 42B The Granary Building',
        address_line_3: 'Wellington Place Business Park',
        address_line_4: 'Leeds',
        address_line_5: 'West Yorkshire',
        address_line_6: 'LS1 4AP',
        address_line_7: '',
        date: '11 March 2026',
      },
    });
  });
});

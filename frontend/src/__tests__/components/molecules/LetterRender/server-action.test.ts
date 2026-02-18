import { updateLetterPreview } from '@molecules/LetterRender/server-action';
import type { FormState } from 'nhs-notify-web-template-management-utils';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('updateLetterPreview', () => {
  it('returns updated fields when recipient is valid', async () => {
    const formState: FormState = {};

    const formData = new FormData();
    formData.append('__systemPersonalisationPackId', 'short-1');
    formData.append('appointmentDate', '2025-01-15');

    const result = await updateLetterPreview(formState, formData);

    expect(result).toEqual({
      fields: {
        __systemPersonalisationPackId: 'short-1',
        appointmentDate: '2025-01-15',
      },
    });
  });

  it('returns updated fields for long tab with valid recipient', async () => {
    const formState: FormState = {};

    const formData = new FormData();
    formData.append('__systemPersonalisationPackId', 'long-1');

    const result = await updateLetterPreview(formState, formData);

    expect(result.fields?.__systemPersonalisationPackId).toBe('long-1');
    expect(result.errorState).toBeUndefined();
  });

  it('handles multiple custom personalisation fields', async () => {
    const formState: FormState = {};

    const formData = new FormData();
    formData.append('__systemPersonalisationPackId', 'short-1');
    formData.append('appointmentDate', '2025-01-15');
    formData.append('clinicName', 'Main Street Clinic');

    const result = await updateLetterPreview(formState, formData);

    expect(result.fields).toEqual({
      __systemPersonalisationPackId: 'short-1',
      appointmentDate: '2025-01-15',
      clinicName: 'Main Street Clinic',
    });
    expect(result.errorState).toBeUndefined();
  });

  it('handles empty custom personalisation field values', async () => {
    const formState: FormState = {};

    const formData = new FormData();
    formData.append('__systemPersonalisationPackId', 'short-1');
    formData.append('appointmentDate', '');

    const result = await updateLetterPreview(formState, formData);

    expect(result.fields?.appointmentDate).toBe('');
    expect(result.errorState).toBeUndefined();
  });

  it('clears previous errorState on successful submission', async () => {
    const formState: FormState = {
      errorState: {
        formErrors: [],
        fieldErrors: {
          __systemPersonalisationPackId: ['Previous error'],
        },
      },
    };

    const formData = new FormData();
    formData.append('__systemPersonalisationPackId', 'short-1');

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState).toBeUndefined();
  });

  it('returns validation error when __systemPersonalisationPackId is empty', async () => {
    const formState: FormState = {};

    const formData = new FormData();
    formData.append('__systemPersonalisationPackId', '');

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        __systemPersonalisationPackId: ['Select an example recipient'],
      },
    });
    expect(result.fields?.__systemPersonalisationPackId).toBe('');
  });

  it('returns validation error when __systemPersonalisationPackId is missing', async () => {
    const formState: FormState = {};

    const formData = new FormData();

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        __systemPersonalisationPackId: ['Select an example recipient'],
      },
    });
  });

  it('returns validation error when __systemPersonalisationPackId is invalid', async () => {
    const formState: FormState = {};

    const formData = new FormData();
    formData.append('__systemPersonalisationPackId', 'invalid-recipient-id');

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        __systemPersonalisationPackId: ['Select an example recipient'],
      },
    });
    expect(result.fields?.__systemPersonalisationPackId).toBe(
      'invalid-recipient-id'
    );
  });

  it('preserves custom field values on validation error', async () => {
    const formState: FormState = {};

    const formData = new FormData();
    formData.append('__systemPersonalisationPackId', '');
    formData.append('appointmentDate', '2025-01-15');

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState).toBeDefined();
    expect(result.fields?.appointmentDate).toBe('2025-01-15');
  });
});

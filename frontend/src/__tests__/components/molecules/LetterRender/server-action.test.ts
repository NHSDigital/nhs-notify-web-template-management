import { updateLetterPreview } from '@molecules/LetterRender/server-action';
import type { LetterRenderFormState } from '@molecules/LetterRender/types';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('updateLetterPreview', () => {
  it('returns updated fields when recipient is valid', async () => {
    const formState: LetterRenderFormState = {
      templateId: 'template-123',
      lockNumber: 1,
      tab: 'short',
      customPersonalisationFields: ['appointmentDate'],
    };

    const formData = new FormData();
    formData.append('systemPersonalisationPackId', 'short-1');
    formData.append('custom_appointmentDate', '2025-01-15');

    const result = await updateLetterPreview(formState, formData);

    expect(result).toMatchObject({
      templateId: 'template-123',
      lockNumber: 1,
      tab: 'short',
      customPersonalisationFields: ['appointmentDate'],
      fields: {
        systemPersonalisationPackId: 'short-1',
        custom_appointmentDate: '2025-01-15',
      },
    });
    expect(result.errorState).toBeUndefined();
  });

  it('returns updated fields for long tab with valid recipient', async () => {
    const formState: LetterRenderFormState = {
      templateId: 'template-123',
      lockNumber: 1,
      tab: 'long',
      customPersonalisationFields: [],
    };

    const formData = new FormData();
    formData.append('systemPersonalisationPackId', 'long-1');

    const result = await updateLetterPreview(formState, formData);

    expect(result.fields?.systemPersonalisationPackId).toBe('long-1');
    expect(result.errorState).toBeUndefined();
  });

  it('handles multiple custom personalisation fields', async () => {
    const formState: LetterRenderFormState = {
      templateId: 'template-123',
      lockNumber: 1,
      tab: 'short',
      customPersonalisationFields: ['appointmentDate', 'clinicName'],
    };

    const formData = new FormData();
    formData.append('systemPersonalisationPackId', 'short-1');
    formData.append('custom_appointmentDate', '2025-01-15');
    formData.append('custom_clinicName', 'Main Street Clinic');

    const result = await updateLetterPreview(formState, formData);

    expect(result.fields).toMatchObject({
      systemPersonalisationPackId: 'short-1',
      custom_appointmentDate: '2025-01-15',
      custom_clinicName: 'Main Street Clinic',
    });
    expect(result.errorState).toBeUndefined();
  });

  it('handles empty custom personalisation field values', async () => {
    const formState: LetterRenderFormState = {
      templateId: 'template-123',
      lockNumber: 1,
      tab: 'short',
      customPersonalisationFields: ['appointmentDate'],
    };

    const formData = new FormData();
    formData.append('systemPersonalisationPackId', 'short-1');
    formData.append('custom_appointmentDate', '');

    const result = await updateLetterPreview(formState, formData);

    expect(result.fields?.custom_appointmentDate).toBe('');
    expect(result.errorState).toBeUndefined();
  });

  it('clears previous errorState on successful submission', async () => {
    const formState: LetterRenderFormState = {
      templateId: 'template-123',
      lockNumber: 1,
      tab: 'short',
      customPersonalisationFields: [],
      errorState: {
        formErrors: [],
        fieldErrors: {
          systemPersonalisationPackId: ['Previous error'],
        },
      },
    };

    const formData = new FormData();
    formData.append('systemPersonalisationPackId', 'short-1');

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState).toBeUndefined();
  });

  it('returns validation error when systemPersonalisationPackId is empty', async () => {
    const formState: LetterRenderFormState = {
      templateId: 'template-123',
      lockNumber: 1,
      tab: 'short',
      customPersonalisationFields: [],
    };

    const formData = new FormData();
    formData.append('systemPersonalisationPackId', '');

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        systemPersonalisationPackId: ['Select an example recipient'],
      },
    });
    expect(result.fields?.systemPersonalisationPackId).toBe('');
  });

  it('returns validation error when systemPersonalisationPackId is missing', async () => {
    const formState: LetterRenderFormState = {
      templateId: 'template-123',
      lockNumber: 1,
      tab: 'short',
      customPersonalisationFields: [],
    };

    const formData = new FormData();

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        systemPersonalisationPackId: ['Select an example recipient'],
      },
    });
  });

  it('returns validation error when systemPersonalisationPackId is invalid', async () => {
    const formState: LetterRenderFormState = {
      templateId: 'template-123',
      lockNumber: 1,
      tab: 'short',
      customPersonalisationFields: [],
    };

    const formData = new FormData();
    formData.append('systemPersonalisationPackId', 'invalid-recipient-id');

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState).toEqual({
      formErrors: [],
      fieldErrors: {
        systemPersonalisationPackId: ['Select an example recipient'],
      },
    });
    expect(result.fields?.systemPersonalisationPackId).toBe(
      'invalid-recipient-id'
    );
  });

  it('preserves custom field values on validation error', async () => {
    const formState: LetterRenderFormState = {
      templateId: 'template-123',
      lockNumber: 1,
      tab: 'short',
      customPersonalisationFields: ['appointmentDate'],
    };

    const formData = new FormData();
    formData.append('systemPersonalisationPackId', '');
    formData.append('custom_appointmentDate', '2025-01-15');

    const result = await updateLetterPreview(formState, formData);

    expect(result.errorState).toBeDefined();
    expect(result.fields?.custom_appointmentDate).toBe('2025-01-15');
  });
});

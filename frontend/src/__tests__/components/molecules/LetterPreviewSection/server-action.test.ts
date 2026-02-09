import { redirect, RedirectType } from 'next/navigation';
import { updateLetterPreview } from '@molecules/LetterPreviewSection/server-action';
import type { FormState } from 'nhs-notify-web-template-management-utils';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
  RedirectType: {
    push: 'push',
    replace: 'replace',
  },
}));

jest.mock('@utils/get-base-path', () => ({
  getBasePath: jest.fn(() => '/templates'),
}));

describe('updateLetterPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createFormData = (data: Record<string, string>): FormData => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    return formData;
  };

  describe('validation', () => {
    it('returns error when templateId is missing', async () => {
      const formData = createFormData({
        variant: 'short',
        lockNumber: '1',
      });

      const result = await updateLetterPreview({} as FormState, formData);

      expect(result.errorState?.fieldErrors?.templateId).toBeDefined();
      expect(redirect).not.toHaveBeenCalled();
    });

    it('returns error when variant is invalid', async () => {
      const formData = createFormData({
        templateId: 'template-123',
        variant: 'invalid',
        lockNumber: '1',
      });

      const result = await updateLetterPreview({} as FormState, formData);

      expect(result.errorState?.fieldErrors?.variant).toBeDefined();
      expect(redirect).not.toHaveBeenCalled();
    });

    it('returns error when lockNumber is missing', async () => {
      const formData = createFormData({
        templateId: 'template-123',
        variant: 'short',
      });

      const result = await updateLetterPreview({} as FormState, formData);

      expect(result.errorState?.fieldErrors?.lockNumber).toBeDefined();
      expect(redirect).not.toHaveBeenCalled();
    });
  });

  describe('successful submission', () => {
    it('redirects to short tab when variant is short', async () => {
      const formData = createFormData({
        templateId: 'template-123',
        variant: 'short',
        lockNumber: '1',
      });

      await updateLetterPreview({} as FormState, formData);

      expect(redirect).toHaveBeenCalledWith(
        '/templates/preview-letter-template/template-123#tab-short',
        RedirectType.push
      );
    });

    it('redirects to long tab when variant is long', async () => {
      const formData = createFormData({
        templateId: 'template-123',
        variant: 'long',
        lockNumber: '1',
      });

      await updateLetterPreview({} as FormState, formData);

      expect(redirect).toHaveBeenCalledWith(
        '/templates/preview-letter-template/template-123#tab-long',
        RedirectType.push
      );
    });

    it('accepts optional pdsPersonalisationPackId', async () => {
      const formData = createFormData({
        templateId: 'template-123',
        variant: 'short',
        lockNumber: '1',
        pdsPersonalisationPackId: 'short-1',
      });

      await updateLetterPreview({} as FormState, formData);

      expect(redirect).toHaveBeenCalledWith(
        '/templates/preview-letter-template/template-123#tab-short',
        RedirectType.push
      );
    });
  });

  describe('custom personalisation extraction', () => {
    it('extracts custom personalisation fields from form data', async () => {
      const formData = createFormData({
        templateId: 'template-123',
        variant: 'short',
        lockNumber: '1',
        custom_appointmentDate: '2025-01-15',
        custom_clinicName: 'Test Clinic',
      });

      // Since we can't easily inspect the extracted values (they're used internally),
      // we just verify the action completes successfully
      await updateLetterPreview({} as FormState, formData);

      expect(redirect).toHaveBeenCalled();
    });
  });

  describe('error state preservation', () => {
    it('preserves templateId in error response', async () => {
      const formData = createFormData({
        templateId: 'template-123',
        variant: 'invalid',
        lockNumber: '1',
      });

      const result = await updateLetterPreview({} as FormState, formData);

      expect(result.templateId).toBe('template-123');
    });

    it('preserves variant in error response', async () => {
      const formData = createFormData({
        templateId: '',
        variant: 'short',
        lockNumber: '1',
      });

      const result = await updateLetterPreview({} as FormState, formData);

      expect(result.variant).toBe('short');
    });

    it('preserves pdsPersonalisationPackId in error response', async () => {
      const formData = createFormData({
        templateId: '',
        variant: 'short',
        lockNumber: '1',
        pdsPersonalisationPackId: 'short-1',
      });

      const result = await updateLetterPreview({} as FormState, formData);

      expect(result.pdsPersonalisationPackId).toBe('short-1');
    });
  });
});

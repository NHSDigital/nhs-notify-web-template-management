import { updateLetterPreview } from '@molecules/LetterRender/server-action';

describe('updateLetterPreview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('successful submission', () => {
    it('returns success for short variant', async () => {
      const result = await updateLetterPreview({
        templateId: 'template-123',
        variant: 'short',
        systemPersonalisationPackId: 'short-1',
        personalisationParameters: { appointmentDate: '2025-01-15' },
      });

      expect(result.success).toBe(true);
    });

    it('returns success for long variant', async () => {
      const result = await updateLetterPreview({
        templateId: 'template-123',
        variant: 'long',
        systemPersonalisationPackId: 'long-1',
        personalisationParameters: { clinicName: 'Test Clinic' },
      });

      expect(result.success).toBe(true);
    });

    it('handles empty systemPersonalisationPackId', async () => {
      const result = await updateLetterPreview({
        templateId: 'template-123',
        variant: 'short',
        systemPersonalisationPackId: '',
        personalisationParameters: {},
      });

      expect(result.success).toBe(true);
    });

    it('handles multiple personalisation parameters', async () => {
      const result = await updateLetterPreview({
        templateId: 'template-123',
        variant: 'short',
        systemPersonalisationPackId: 'short-1',
        personalisationParameters: {
          appointmentDate: '2025-01-15',
          clinicName: 'Test Clinic',
          doctorName: 'Dr. Smith',
        },
      });

      expect(result.success).toBe(true);
    });
  });

  // Note: Validation tests have been removed as the current implementation
  // does not perform validation (per requirements). When CCM-13495 implements
  // the actual backend integration, validation tests should be added here.
});

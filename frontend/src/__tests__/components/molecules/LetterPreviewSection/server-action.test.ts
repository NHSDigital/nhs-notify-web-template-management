import {
  updateLetterPreview,
  type UpdateLetterPreviewInput,
} from '@molecules/LetterRender/server-action';

describe('updateLetterPreview', () => {
  it('accepts the expected input shape', async () => {
    const input: UpdateLetterPreviewInput = {
      templateId: 'template-123',
      tab: 'short',
      systemPersonalisationPackId: 'short-1',
      personalisationParameters: { appointmentDate: '2025-01-15' },
    };

    await expect(updateLetterPreview(input)).resolves.toBeUndefined();
  });

  // TODO: CCM-13495 - Add tests for actual implementation
});

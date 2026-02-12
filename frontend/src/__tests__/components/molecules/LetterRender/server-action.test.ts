import { updateLetterPreview } from '@molecules/LetterRender/server-action';
import type { UpdateLetterPreviewInput } from '@molecules/LetterRender/types';

describe('updateLetterPreview', () => {
  it('accepts the expected input shape and resolves', async () => {
    const input: UpdateLetterPreviewInput = {
      templateId: 'template-123',
      tab: 'short',
      systemPersonalisationPackId: 'short-1',
      personalisation: {
        firstName: 'Jo',
        lastName: 'Bloggs',
        appointmentDate: '2025-01-15',
      },
    };

    await expect(updateLetterPreview(input)).resolves.toBeUndefined();
  });

  it('handles input with empty personalisation', async () => {
    const input: UpdateLetterPreviewInput = {
      templateId: 'template-456',
      tab: 'long',
      systemPersonalisationPackId: '',
      personalisation: {},
    };

    await expect(updateLetterPreview(input)).resolves.toBeUndefined();
  });

  // TODO: CCM-13495 - Add tests for actual implementation
});

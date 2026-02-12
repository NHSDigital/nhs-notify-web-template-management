import { updateLetterPreview } from '@molecules/LetterRender/server-action';
import type { UpdateLetterPreviewInput } from '@molecules/LetterRender/types';

describe('updateLetterPreview', () => {
  it('accepts the expected input shape and resolves', async () => {
    const input: UpdateLetterPreviewInput = {
      templateId: 'template-123',
      lockNumber: 1,
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
});

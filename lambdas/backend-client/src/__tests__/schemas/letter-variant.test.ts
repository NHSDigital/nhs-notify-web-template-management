import { $LetterVariant } from '../../schemas/letter-variant';

describe('$LetterVariant', () => {
  const baseVariant = {
    id: 'variant-123',
    name: 'Standard C5',
    sheetSize: 'A4',
    maxSheets: 5,
    bothSides: true,
    printColour: 'black',
    envelopeSize: 'C5',
    dispatchTime: 'standard',
    postage: 'economy',
    status: 'PROD',
    type: 'STANDARD',
  };

  test('passes validation for a global letter variant', () => {
    const result = $LetterVariant.safeParse(baseVariant);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(baseVariant);
  });

  test('passes validation for a client-scoped letter variant', () => {
    const payload = {
      ...baseVariant,
      clientId: 'client-1',
    };

    const result = $LetterVariant.safeParse(payload);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(payload);
  });

  test('passes validation for a campaign-scoped letter variant when clientId is present', () => {
    const payload = {
      ...baseVariant,
      clientId: 'client-1',
      campaignId: 'campaign-1',
    };

    const result = $LetterVariant.safeParse(payload);

    expect(result.success).toBe(true);
    expect(result.data).toEqual(payload);
  });

  test('fails validation when campaignId is provided without clientId', () => {
    const result = $LetterVariant.safeParse({
      ...baseVariant,
      campaignId: 'campaign-1',
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten()).toEqual(
      expect.objectContaining({
        fieldErrors: {
          clientId: ['clientId is required when campaignId is set'],
        },
      })
    );
  });

  test('fails validation when type is invalid', () => {
    const result = $LetterVariant.safeParse({
      ...baseVariant,
      type: 'invalid type',
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten()).toEqual(
      expect.objectContaining({
        fieldErrors: {
          type: [
            'Invalid option: expected one of "AUDIO"|"BRAILLE"|"STANDARD"',
          ],
        },
      })
    );
  });

  test('fails validation when status is invalid', () => {
    const result = $LetterVariant.safeParse({
      ...baseVariant,
      status: 'invalid status',
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten()).toEqual(
      expect.objectContaining({
        fieldErrors: {
          status: [
            'Invalid option: expected one of "DISABLED"|"DRAFT"|"INT"|"PROD"',
          ],
        },
      })
    );
  });
});

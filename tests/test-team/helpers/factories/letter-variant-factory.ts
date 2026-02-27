import { randomUUID } from 'node:crypto';
import type { LetterVariant } from 'nhs-notify-web-template-management-types';

export const makeLetterVariant = (
  overrides: Partial<LetterVariant> = {}
): LetterVariant => ({
  id: randomUUID(),
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
  ...overrides,
});

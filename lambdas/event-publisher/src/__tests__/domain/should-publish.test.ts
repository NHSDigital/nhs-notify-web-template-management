import {
  LetterProperties,
  TemplateDto,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';
import { shouldPublish } from '../../domain/should-publish';

describe('shouldPublish', () => {
  test.each(['EMAIL', 'SMS', 'NHS_APP'] satisfies TemplateType[])(
    'templateType %p should return true',
    (type) => {
      expect(shouldPublish({ templateType: type } as TemplateDto)).toEqual(
        true
      );
    }
  );

  test.each([false, undefined])(
    'templateType LETTER should return false when proofingEnabled %p',
    (proofingEnabled) => {
      expect(
        shouldPublish({
          templateType: 'LETTER',
          templateStatus: 'SUBMITTED',
          proofingEnabled,
        } as TemplateDto & LetterProperties)
      ).toEqual(false);
    }
  );

  test.each([
    'DELETED',
    'PENDING_PROOF_REQUEST',
    'PROOF_AVAILABLE',
    'SUBMITTED',
    'WAITING_FOR_PROOF',
  ] satisfies TemplateStatus[])(
    'templateType LETTER should return true when templateStatus is %p and proofingEnabled is true',
    (templateStatus) => {
      expect(
        shouldPublish({
          templateType: 'LETTER',
          templateStatus,
          proofingEnabled: true,
        } as TemplateDto & LetterProperties)
      ).toEqual(true);
    }
  );
});

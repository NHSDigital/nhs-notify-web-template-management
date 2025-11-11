import { TemplateStatus, TemplateType } from 'nhs-notify-backend-client';
import { shouldPublish } from '../../domain/should-publish';

describe('shouldPublish', () => {
  test.each(['EMAIL', 'SMS', 'NHS_APP'] satisfies TemplateType[])(
    'templateType %p should return true',
    (type) => {
      const publish = shouldPublish(
        {
          templateType: type,
          id: 'id',
          templateStatus: 'NOT_YET_SUBMITTED',
        },
        {
          templateType: type,
          id: 'id',
          templateStatus: 'SUBMITTED',
        }
      );

      expect(publish).toEqual(true);
    }
  );

  test.each([false, undefined])(
    'templateType LETTER should return false when proofingEnabled is %p',
    (proofingEnabled) => {
      const publish = shouldPublish(
        {
          id: 'id',
          templateType: 'LETTER',
          templateStatus: 'PROOF_AVAILABLE',
          proofingEnabled,
        },
        {
          id: 'id',
          templateType: 'LETTER',
          templateStatus: 'SUBMITTED',
          proofingEnabled,
        }
      );

      expect(publish).toEqual(false);
    }
  );

  type LetterStatus = Exclude<TemplateStatus, 'NOT_YET_SUBMITTED'>;

  const letterPublishCases: Record<LetterStatus, boolean> = {
    DELETED: true,
    PENDING_PROOF_REQUEST: true,
    PROOF_AVAILABLE: true,
    SUBMITTED: true,
    WAITING_FOR_PROOF: true,
    PENDING_UPLOAD: false,
    PENDING_VALIDATION: false,
    VALIDATION_FAILED: false,
    VIRUS_SCAN_FAILED: false,
    LOCKED: false,
  };

  // not all of these transitions are expected in real usage
  test.each(Object.entries(letterPublishCases) as [TemplateStatus, boolean][])(
    'templateType LETTER with current status %p should return %p when proofingEnabled is true and status of previous is not restrictive',
    (templateStatus, publishable) => {
      const publish = shouldPublish(
        {
          id: 'id',
          templateType: 'LETTER',
          templateStatus: 'PENDING_PROOF_REQUEST',
          proofingEnabled: true,
        },
        {
          id: 'id',
          templateType: 'LETTER',
          templateStatus,
          proofingEnabled: true,
        }
      );

      expect(publish).toEqual(publishable);
    }
  );

  // not all of these transitions are expected in real usage
  test.each(Object.entries(letterPublishCases) as [TemplateStatus, boolean][])(
    'templateType LETTER with new status DELETED and previous status %p should return %p when proofingEnabled is true',
    (templateStatus, publishable) => {
      const publish = shouldPublish(
        {
          id: 'id',
          templateType: 'LETTER',
          templateStatus,
          proofingEnabled: true,
        },
        {
          id: 'id',
          templateType: 'LETTER',
          templateStatus: 'DELETED',
          proofingEnabled: true,
        }
      );

      expect(publish).toEqual(publishable);
    }
  );

  test('does not publish if templateType is LETTER and no previous template is available', () => {
    expect(
      shouldPublish(undefined, {
        id: 'id',
        templateType: 'LETTER',
        templateStatus: 'DELETED',
        proofingEnabled: true,
      })
    ).toEqual(false);
  });
});

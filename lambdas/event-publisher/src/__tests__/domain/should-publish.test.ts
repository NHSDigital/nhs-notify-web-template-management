import type {
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-web-template-management-types';
import { shouldPublish } from '../../domain/should-publish';

describe('shouldPublish', () => {
  test.each(['EMAIL', 'SMS', 'NHS_APP'] satisfies TemplateType[])(
    'templateType %p should return true',
    (type) => {
      const publish = shouldPublish(
        {
          templateType: type,
          id: 'id',
          clientId: 'client-id',
          templateStatus: 'NOT_YET_SUBMITTED',
        },
        {
          templateType: type,
          id: 'id',
          clientId: 'client-id',
          templateStatus: 'SUBMITTED',
        }
      );

      expect(publish).toEqual(true);
    }
  );

  test.each([false, undefined])(
    'templateType LETTER should return false when letterVersion is not AUTHORING',
    (proofingEnabled) => {
      const publish = shouldPublish(
        {
          id: 'id',
          clientId: 'client-id',
          templateType: 'LETTER',
          templateStatus: 'PROOF_AVAILABLE',
          proofingEnabled,
        },
        {
          id: 'id',
          clientId: 'client-id',
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
    PENDING_PROOF_REQUEST: false,
    PENDING_UPLOAD: false,
    PENDING_VALIDATION: false,
    PROOF_APPROVED: true,
    PROOF_AVAILABLE: false,
    SUBMITTED: true,
    VALIDATION_FAILED: false,
    VIRUS_SCAN_FAILED: false,
    WAITING_FOR_PROOF: false,
  };

  // not all of these transitions are expected in real usage
  test.each(Object.entries(letterPublishCases) as [TemplateStatus, boolean][])(
    'templateType LETTER with current status %p should return %p when proofingEnabled is true and status of previous is not restrictive',
    (templateStatus, publishable) => {
      const publish = shouldPublish(
        {
          id: 'id',
          clientId: 'client-id',
          templateType: 'LETTER',
          templateStatus: 'SUBMITTED',
          proofingEnabled: true,
          letterVersion: 'AUTHORING',
        },
        {
          id: 'id',
          clientId: 'client-id',
          templateType: 'LETTER',
          templateStatus,
          proofingEnabled: true,
          letterVersion: 'AUTHORING',
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
          clientId: 'client-id',
          templateType: 'LETTER',
          templateStatus,
          proofingEnabled: true,
          letterVersion: 'AUTHORING',
        },
        {
          id: 'id',
          clientId: 'client-id',
          templateType: 'LETTER',
          templateStatus: 'DELETED',
          proofingEnabled: true,
          letterVersion: 'AUTHORING',
        }
      );

      expect(publish).toEqual(publishable);
    }
  );

  test('does not publish if templateType is LETTER and no previous template is available', () => {
    expect(
      shouldPublish(undefined, {
        id: 'id',
        clientId: 'client-id',
        templateType: 'LETTER',
        templateStatus: 'DELETED',
        proofingEnabled: true,
        letterVersion: 'AUTHORING',
      })
    ).toEqual(false);
  });
});

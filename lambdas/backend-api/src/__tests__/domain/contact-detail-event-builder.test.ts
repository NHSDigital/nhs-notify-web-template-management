import { randomUUID } from 'node:crypto';
import { ContactDetailEventBuilder } from '../../domain/contact-detail-event-builder';

jest.mock('node:crypto');

describe('ContactDetailEventBuilder', () => {
  const RANDOM_UUID = 'e23e3ff2-640f-4d30-a5d6-d5449f2968c1';
  jest.mocked(randomUUID).mockReturnValue(RANDOM_UUID);

  const NOW = '2026-04-27T10:30:00.000Z';
  const metadata = {
    source: '//notify.nhs.uk/app/nhs-notify-template-management-dev/miha12',
    version: '1.0.0',
  };

  let builder: ContactDetailEventBuilder;

  beforeEach(() => {
    builder = new ContactDetailEventBuilder(metadata);
    jest.useFakeTimers();
    jest.setSystemTime(new Date(NOW));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('buildVerificationRequestedEvent', () => {
    it('should build a complete event for EMAIL verification', () => {
      const result = builder.buildVerificationRequestedEvent({
        id: '60eb0382-0433-431e-9bde-5009ce11fc16',
        type: 'EMAIL',
        value: 'user@example.com',
        otp: '123456',
      });

      expect(result).toEqual({
        data: {
          id: '60eb0382-0433-431e-9bde-5009ce11fc16',
          type: 'EMAIL',
          value: 'user@example.com',
          otp: '123456',
        },
        datacontenttype: 'application/json',
        dataschema:
          'https://notify.nhs.uk/events/schemas/ContactDetailVerificationRequested/v1.json',
        dataschemaversion: '1.0.0',
        id: RANDOM_UUID,
        plane: 'data',
        source: '//notify.nhs.uk/app/nhs-notify-template-management-dev/miha12',
        specversion: '1.0',
        subject: '60eb0382-0433-431e-9bde-5009ce11fc16',
        time: NOW,
        type: 'uk.nhs.notify.template-management.ContactDetailVerificationRequested.v1',
      });
    });

    it('should build a complete event for SMS verification', () => {
      const result = builder.buildVerificationRequestedEvent({
        id: '149bd833-4df5-4d77-adba-4cdf2ae562c7',
        type: 'SMS',
        value: '+447890123456',
        otp: '654321',
      });

      expect(result).toEqual({
        datacontenttype: 'application/json',
        time: NOW,
        id: RANDOM_UUID,
        source: '//notify.nhs.uk/app/nhs-notify-template-management-dev/miha12',
        specversion: '1.0',
        plane: 'data',
        subject: '149bd833-4df5-4d77-adba-4cdf2ae562c7',
        type: 'uk.nhs.notify.template-management.ContactDetailVerificationRequested.v1',
        dataschema:
          'https://notify.nhs.uk/events/schemas/ContactDetailVerificationRequested/v1.json',
        dataschemaversion: '1.0.0',
        data: {
          id: '149bd833-4df5-4d77-adba-4cdf2ae562c7',
          type: 'SMS',
          value: '+447890123456',
          otp: '654321',
        },
      });
    });
  });
});

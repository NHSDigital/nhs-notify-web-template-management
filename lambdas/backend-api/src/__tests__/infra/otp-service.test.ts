import crypto from 'node:crypto';
import { mockClient } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { mockDeep } from 'jest-mock-extended';
import { OtpService } from '@backend-api/infra/otp-service';
import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { ContactDetailEventBuilder } from '@backend-api/domain/contact-detail-event-builder';
import { makeContactDetailVerificationRequestedEvent } from '../helpers';

const EVENT_TOPIC_ARN = 'mock-event-topic-arn';

const event = makeContactDetailVerificationRequestedEvent();

function setup() {
  const sns = mockClient(SNSClient);
  const eventBuilder = mockDeep<ContactDetailEventBuilder>();

  eventBuilder.buildVerificationRequestedEvent.mockReturnValue(event);

  const service = new OtpService(
    eventBuilder,
    sns as unknown as SNSClient,
    EVENT_TOPIC_ARN
  );

  return { service, mocks: { eventBuilder, sns } };
}

describe('OtpService', () => {
  describe('generate', () => {
    it('returns a random 6 digit integer OTP', async () => {
      const { service } = setup();

      jest.spyOn(crypto, 'randomInt').mockImplementationOnce(() => 123_456);

      const result = await service.generate();

      expect(result).toEqual({ data: '123456' });

      expect(crypto.randomInt).toHaveBeenCalledWith(0, 1_000_000);
    });

    it('pads with leading 0s', async () => {
      const { service } = setup();

      jest.spyOn(crypto, 'randomInt').mockImplementationOnce(() => 123);

      const result = await service.generate();

      expect(result).toEqual({ data: '000123' });
    });

    it('returns internal error result if number generation fails', async () => {
      const { service } = setup();

      jest.spyOn(crypto, 'randomInt').mockImplementationOnce(() => {
        throw new Error('Oh no');
      });

      const result = await service.generate();

      expect(result.data).toBeUndefined();
      expect(result.error?.errorMeta.code).toBe(500);
      expect(result.error?.errorMeta.description).toBe(
        'Unable to generate OTP'
      );
    });
  });

  describe('send', () => {
    it('generates an event and sends it via SNS', async () => {
      const { service, mocks } = setup();

      const result = await service.send(
        {
          id: 'contact-details-id',
          status: 'PENDING_VERIFICATION',
          type: 'EMAIL',
          value: 'email@nhs.net',
        },
        '123456'
      );

      expect(result.data).toBeUndefined();
      expect(result.error).toBeUndefined();

      expect(
        mocks.eventBuilder.buildVerificationRequestedEvent
      ).toHaveBeenCalledWith({
        id: 'contact-details-id',
        type: 'EMAIL',
        value: 'email@nhs.net',
        otp: '123456',
      });

      expect(mocks.sns).toHaveReceivedCommandWith(PublishCommand, {
        TopicArn: EVENT_TOPIC_ARN,
        Message: expect.any(String),
      });

      const calls = mocks.sns.commandCalls(PublishCommand);
      const message = JSON.parse(calls[0].args[0].input.Message as string);

      expect(message).toEqual(event);
    });

    it('returns failure if event generation throws an error', async () => {
      const { service, mocks } = setup();

      const error = new Error('Invalid event');

      mocks.eventBuilder.buildVerificationRequestedEvent.mockImplementationOnce(
        () => {
          throw error;
        }
      );

      const result = await service.send(
        {
          id: 'contact-details-id',
          status: 'PENDING_VERIFICATION',
          type: 'EMAIL',
          value: 'email@nhs.net',
        },
        '123456'
      );

      expect(result.data).toBeUndefined();
      expect(result.error).toEqual({
        actualError: error,
        errorMeta: {
          code: 500,
          description:
            'Unable to publish ContactDetailVerificationRequested event',
        },
      });

      expect(mocks.sns).not.toHaveReceivedCommand(PublishCommand);
    });

    it('returns failure if sns publish throws an error', async () => {
      const { service, mocks } = setup();

      const error = new Error('SNS error');

      mocks.sns.on(PublishCommand).rejectsOnce(error);

      const result = await service.send(
        {
          id: 'contact-details-id',
          status: 'PENDING_VERIFICATION',
          type: 'EMAIL',
          value: 'email@nhs.net',
        },
        '123456'
      );

      expect(result.data).toBeUndefined();
      expect(result.error).toEqual({
        actualError: error,
        errorMeta: {
          code: 500,
          description:
            'Unable to publish ContactDetailVerificationRequested event',
        },
      });
    });
  });
});

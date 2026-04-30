import type { NHSNotifyEventEnvelope } from '@nhsdigital/nhs-notify-event-schemas-template-management';
import {
  NHSNotifyEventBuilder,
  NHSNotifyEventBuilderMetadata,
} from './event-builder';

type TestEventData = {
  foo: string;
};

type TestEvent = NHSNotifyEventEnvelope & {
  data: TestEventData;
};

type TestInput = Pick<TestEvent, 'data' | 'id' | 'plane' | 'subject' | 'type'>;

class TestEventBuilder extends NHSNotifyEventBuilder {
  buildEvent(input: TestInput): TestEvent {
    const envelope = this.buildEventMetadata(input);

    return {
      ...envelope,
      data: input.data,
    };
  }
}

describe('NHSNotifyEventBuilder', () => {
  const metadata: NHSNotifyEventBuilderMetadata = {
    source: 'test-source',
    version: '1.2.3',
  };

  let builder: TestEventBuilder;

  beforeEach(() => {
    builder = new TestEventBuilder(metadata);
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T10:30:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('buildEvent', () => {
    it('should build a complete event with data', () => {
      const input: TestInput = {
        data: { foo: 'bar' },
        id: 'test-id-123',
        plane: 'control',
        subject: 'test-subject',
        type: 'test-event',
      };
      const result = builder.buildEvent(input);

      expect(result).toEqual({
        datacontenttype: 'application/json',
        time: '2024-01-15T10:30:00.000Z',
        id: 'test-id-123',
        source: 'test-source',
        specversion: '1.0',
        plane: 'control',
        subject: 'test-subject',
        type: 'uk.nhs.notify.template-management.test-event.v1',
        dataschema: 'https://notify.nhs.uk/events/schemas/test-event/v1.json',
        dataschemaversion: '1.2.3',
        data: { foo: 'bar' },
      });
    });

    it('should build event envelope with data plane when specified', () => {
      const input: TestInput = {
        data: { foo: 'bar' },
        id: 'id-456',
        plane: 'data',
        subject: 'event-subject',
        type: 'event-type',
      };
      const result = builder.buildEvent(input);

      expect(result).toEqual({
        datacontenttype: 'application/json',
        time: '2024-01-15T10:30:00.000Z',
        id: 'id-456',
        source: 'test-source',
        specversion: '1.0',
        plane: 'data',
        subject: 'event-subject',
        type: 'uk.nhs.notify.template-management.event-type.v1',
        dataschema: 'https://notify.nhs.uk/events/schemas/event-type/v1.json',
        dataschemaversion: '1.2.3',
        data: { foo: 'bar' },
      });
    });

    it('should extract major version from semantic version', () => {
      const builderWithVersion = new TestEventBuilder({
        source: 'test-source',
        version: '2.5.7',
      });

      const input: TestInput = {
        data: { foo: 'bar' },
        id: 'id-789',
        plane: 'control',
        subject: 'subject',
        type: 'event-type',
      };
      const result = builderWithVersion.buildEvent(input);

      expect(result.type).toBe(
        'uk.nhs.notify.template-management.event-type.v2'
      );
      expect(result.dataschema).toBe(
        'https://notify.nhs.uk/events/schemas/event-type/v2.json'
      );
      expect(result.dataschemaversion).toBe('2.5.7');
    });

    it('should include source from metadata', () => {
      const customBuilder = new TestEventBuilder({
        source: 'custom-source-service',
        version: '1.0.0',
      });

      const input: TestInput = {
        data: { foo: 'bar' },
        id: 'id-123',
        plane: 'control',
        subject: 'subject',
        type: 'event-type',
      };
      const result = customBuilder.buildEvent(input);

      expect(result.source).toBe('custom-source-service');
    });
  });
});

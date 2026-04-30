import type { NHSNotifyEventEnvelope } from '@nhsdigital/nhs-notify-event-schemas-template-management';

export type NHSNotifyEventBuilderMetadata = {
  source: string;
  version: string;
};

export abstract class NHSNotifyEventBuilder {
  constructor(private metadata: NHSNotifyEventBuilderMetadata) {}

  protected buildEventMetadata(
    event: Pick<NHSNotifyEventEnvelope, 'id' | 'plane' | 'subject' | 'type'>
  ): NHSNotifyEventEnvelope {
    return {
      datacontenttype: 'application/json',
      time: new Date().toISOString(),
      id: event.id,
      source: this.metadata.source,
      specversion: '1.0',
      plane: event.plane,
      subject: event.subject,
      type: `uk.nhs.notify.template-management.${event.type}.v${this.majorVersion}`,
      dataschema: `https://notify.nhs.uk/events/schemas/${event.type}/v${this.majorVersion}.json`,
      dataschemaversion: this.metadata.version,
    };
  }

  private get majorVersion(): string {
    return this.metadata.version.split('.')[0];
  }
}

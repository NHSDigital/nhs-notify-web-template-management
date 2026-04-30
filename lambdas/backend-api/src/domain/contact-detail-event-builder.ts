import { randomUUID } from 'node:crypto';
import {
  $ContactDetailVerificationRequestedEventV1,
  type ContactDetailVerificationRequestedEventV1,
} from '@nhsdigital/nhs-notify-event-schemas-template-management';
import { NHSNotifyEventBuilder } from 'nhs-notify-event-builder';

export class ContactDetailEventBuilder extends NHSNotifyEventBuilder {
  buildVerificationRequestedEvent(
    data: ContactDetailVerificationRequestedEventV1['data']
  ): ContactDetailVerificationRequestedEventV1 {
    const event = this.buildEventMetadata({
      id: randomUUID(),
      subject: data.id,
      type: 'ContactDetailVerificationRequested',
      plane: 'data',
    });

    return $ContactDetailVerificationRequestedEventV1.parse({
      ...event,
      data,
    });
  }
}

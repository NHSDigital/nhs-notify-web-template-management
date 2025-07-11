import { EventBuilder } from '../domain/event-builder';
import { SNSRepository } from '../infra/sns-repository';
import { PublishableEventRecord } from '../domain/input-schemas';
import { Logger } from 'nhs-notify-web-template-management-utils/logger';

export class App {
  constructor(
    private readonly snsRepository: SNSRepository,
    private readonly eventBuilder: EventBuilder,
    private readonly logger: Logger
  ) {}

  async publishEvent(publishableEventRecord: PublishableEventRecord) {
    const event = this.eventBuilder.buildEvent(publishableEventRecord);

    if (!event) {
      this.logger.debug({
        description: 'Not publishing event',
        publishableEventRecord,
      });
      return;
    }

    await this.snsRepository.publish(event);
  }
}

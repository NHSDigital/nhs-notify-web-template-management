import { Logger } from 'nhs-notify-web-template-management-utils/logger';
import { SharedFileRepository } from 'src/infra/shared-file-repository';
import { EventBuilder } from '../domain/event-builder';
import { SNSRepository } from '../infra/sns-repository';
import { PublishableEventRecord } from '../domain/input-schemas';

export class App {
  constructor(
    private readonly snsRepository: SNSRepository,
    private readonly eventBuilder: EventBuilder,
    private readonly sharedFileRepository: SharedFileRepository,
    private readonly logger: Logger
  ) {}

  async publishEvent(publishableEventRecord: PublishableEventRecord) {
    const eventBuilderOutput = this.eventBuilder.buildEvent(
      publishableEventRecord
    );

    if (!eventBuilderOutput) {
      this.logger.debug({
        description: 'Not publishing event',
        publishableEventRecord,
      });
      return;
    }

    const { event, sharedFiles = [] } = eventBuilderOutput;

    for (const [source, destination] of Object.entries(sharedFiles)) {
      await this.sharedFileRepository.upload(source, destination);
    }

    await this.snsRepository.publish(event);
  }
}

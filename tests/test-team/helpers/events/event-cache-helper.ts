import { z } from 'zod';
import {
  S3Client,
  SelectObjectContentCommand,
  SelectObjectContentEventStream,
} from '@aws-sdk/client-s3';
import {
  $TemplateCompletedEventV1,
  $TemplateDeletedEventV1,
  $TemplateDraftedEventV1,
} from '@nhsdigital/nhs-notify-event-schemas-template-management';
import {
  differenceInSeconds,
  addHours,
  startOfHour,
  endOfHour,
} from 'date-fns';
import { S3Helper } from '../s3-helper';

const $NHSNotifyTemplateEvent = z.discriminatedUnion('type', [
  $TemplateCompletedEventV1,
  $TemplateDraftedEventV1,
  $TemplateDeletedEventV1,
]);

type NHSNotifyTemplateEvent = z.infer<typeof $NHSNotifyTemplateEvent>;

export class EventCacheHelper {
  private readonly s3 = new S3Client({ region: 'eu-west-2' });
  private readonly bucketName = process.env.EVENT_CACHE_BUCKET_NAME;

  async findEvents(
    from: Date,
    templateIds: string[]
  ): Promise<NHSNotifyTemplateEvent[]> {
    if (templateIds.length === 0) {
      return [];
    }

    const files = await Promise.all(
      this.buildFilePaths(from).map((path) => {
        return S3Helper.listAll(this.bucketName, path);
      })
    );

    const filteredFiles = S3Helper.filterAndSort(files.flat(), from);

    const eventPromises = filteredFiles.map((file) =>
      this.queryFileForEvents(file.Key!, templateIds)
    );

    const results = await Promise.all(eventPromises);

    return results.flat();
  }

  private async queryFileForEvents(
    fileName: string,
    templateIds: string[]
  ): Promise<NHSNotifyTemplateEvent[]> {
    const command = new SelectObjectContentCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Expression: this.buildS3Query(templateIds),
      ExpressionType: 'SQL',
      InputSerialization: {
        JSON: { Type: 'LINES' },
        CompressionType: 'NONE',
      },
      OutputSerialization: {
        JSON: { RecordDelimiter: '\n' },
      },
    });

    const response = await this.s3.send(command);

    if (!response.Payload) {
      return [];
    }

    return await this.parse(fileName, response.Payload);
  }

  private async parse(
    fileName: string,
    payload: AsyncIterable<SelectObjectContentEventStream>
  ): Promise<NHSNotifyTemplateEvent[]> {
    const events: NHSNotifyTemplateEvent[] = [];

    for await (const event of payload) {
      if (!event.Records?.Payload) continue;

      const chunk = Buffer.from(event.Records.Payload).toString('utf8');

      const parsedEvents = chunk
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          const { data, success, error } = $NHSNotifyTemplateEvent.safeParse(
            JSON.parse(line)
          );

          if (success) {
            return data;
          }

          throw new Error(
            `Unrecognized event schema detected in S3 file: ${fileName}`,
            {
              cause: { error },
            }
          );
        });

      events.push(...parsedEvents);
    }

    return events;
  }

  /*
   * Get files paths for the current hour
   * and next hour if the difference in seconds is greater than toleranceInSeconds
   *
   * The way firehose stores files is yyyy/mm/dd/hh.
   * On a boundary of 15:59:58 you'll find files in both 15 and 16 hour folders
   */
  private buildFilePaths(start: Date, toleranceInSeconds = 30): string[] {
    const paths = [this.buildPathPrefix(start)];

    const end = addHours(startOfHour(start), 1);

    const difference = differenceInSeconds(endOfHour(start), start, {
      roundingMethod: 'ceil',
    });

    if (toleranceInSeconds >= difference) {
      paths.push(this.buildPathPrefix(end));
    }

    return paths;
  }

  private buildS3Query(templateIds: string[]): string {
    const formattedIds = templateIds.map((r) => `'${r}'`);

    return `SELECT * FROM S3Object s WHERE s.data.id IN (${formattedIds})`;
  }

  private buildPathPrefix(date: Date): string {
    return date
      .toISOString()
      .slice(0, 13)
      .replace('T', '/')
      .replaceAll('-', '/');
  }
}

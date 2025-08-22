import {
  ListObjectsV2Command,
  S3Client,
  SelectObjectContentCommand,
  SelectObjectContentEventStream,
  _Object,
} from '@aws-sdk/client-s3';
import { Template } from '../types';

interface SNSEnvelope {
  Message: string;
}

// TODO: Remove once we have the proper types merged in
interface TemplateEvent {
  id: string;
  type: string;
  data: Template;
}

export class EventCacheHelper {
  private readonly s3 = new S3Client({ region: 'eu-west-2' });
  private readonly bucketName = process.env.EVENT_CACHE_BUCKET_NAME;

  async findEvents(
    from: Date,
    templateIds: string[]
  ): Promise<TemplateEvent[]> {
    if (templateIds.length === 0) {
      return [];
    }

    const files = await this.getAllS3items(this.buildEventCachePrefix(from));

    const filteredFiles = this.filterAndSortFiles(files, from);

    const eventPromises = filteredFiles.map((file) =>
      this.queryFileForEvents(file.Key!, templateIds)
    );

    const results = await Promise.all(eventPromises);

    return results.flat();
  }

  private filterAndSortFiles(files: _Object[], from: Date): _Object[] {
    return files
      .filter(
        ({ LastModified }) => (LastModified?.getTime() ?? 0) > from.getTime()
      )
      .sort(
        (a, b) =>
          (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0)
      );
  }

  private async getAllS3items(prefix: string): Promise<_Object[]> {
    const allItems: _Object[] = [];
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const response = await this.s3.send(command);

      if (response.Contents) {
        allItems.push(...response.Contents);
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return allItems;
  }

  private async queryFileForEvents(
    fileName: string,
    templateIds: string[]
  ): Promise<TemplateEvent[]> {
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

    return await this.processS3SelectResponse(response.Payload);
  }

  private async processS3SelectResponse(
    payload: AsyncIterable<SelectObjectContentEventStream>
  ): Promise<TemplateEvent[]> {
    const events: TemplateEvent[] = [];

    for await (const event of payload) {
      if (!event.Records?.Payload) continue;

      const chunk = Buffer.from(event.Records.Payload).toString('utf8');

      const parsedEvents = chunk
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => {
          const snsWrapper = JSON.parse(line) as SNSEnvelope;
          return JSON.parse(snsWrapper.Message) as TemplateEvent;
        });

      events.push(...parsedEvents);
    }

    return events;
  }

  private buildS3Query(templateIds: string[]): string {
    const likeConditions = templateIds
      .map((id) => `s.Message LIKE '%${id}%'`)
      .join(' OR ');

    return `SELECT * FROM S3Object s WHERE ${likeConditions}`;
  }

  private buildEventCachePrefix(date: Date): string {
    return date
      .toISOString()
      .slice(0, 13)
      .replace('T', '/')
      .replaceAll('-', '/');
  }
}

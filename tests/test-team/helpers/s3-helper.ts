import {
  _Object,
  ListObjectsV2Command,
  S3Client,
  SelectObjectContentCommand,
} from '@aws-sdk/client-s3';

export class S3Helper {
  private static readonly client = new S3Client({ region: 'eu-west-2' });

  static async listAll(bucket: string, prefix: string): Promise<_Object[]> {
    const allItems: _Object[] = [];
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const response = await this.client.send(command);

      if (response.Contents) {
        allItems.push(...response.Contents);
      }

      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    return allItems;
  }

  static async queryJSONLFile(bucket: string, fileName: string, query: string) {
    const command = new SelectObjectContentCommand({
      Bucket: bucket,
      Key: fileName,
      Expression: query,
      ExpressionType: 'SQL',
      InputSerialization: {
        JSON: { Type: 'LINES' },
        CompressionType: 'NONE',
      },
      OutputSerialization: {
        JSON: { RecordDelimiter: '\n' },
      },
    });

    return S3Helper.client.send(command);
  }

  static filterAndSort(files: _Object[], from: Date): _Object[] {
    return S3Helper.sort(S3Helper.filter([...files], from));
  }

  static filter(files: _Object[], from: Date): _Object[] {
    return files.filter(
      ({ LastModified }) => (LastModified?.getTime() ?? 0) > from.getTime()
    );
  }

  static sort(files: _Object[]): _Object[] {
    return files.sort(
      (a, b) =>
        (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0)
    );
  }
}

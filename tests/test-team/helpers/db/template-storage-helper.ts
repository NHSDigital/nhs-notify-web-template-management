import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  NotFound,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { Template } from '../types';

type TemplateKey = { owner: string; id: string };

export class TemplateStorageHelper {
  private readonly ddbDocClient: DynamoDBDocumentClient =
    DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'eu-west-2' }));
  private readonly s3 = new S3Client({ region: 'eu-west-2' });

  private seedData: Template[] = [];

  private adHocTemplateKeys: TemplateKey[] = [];

  async getTemplate(key: TemplateKey): Promise<Template> {
    const { Item } = await this.ddbDocClient.send(
      new GetCommand({ TableName: process.env.TEMPLATES_TABLE_NAME, Key: key })
    );

    return Item as Template;
  }

  /**
   * Seed a load of templates into the database
   */
  async seedTemplateData(data: Template[]) {
    this.seedData.push(...data);

    const chunks = TemplateStorageHelper.chunk(data);

    await Promise.all(
      chunks.map(async (chunk) => {
        await this.ddbDocClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [process.env.TEMPLATES_TABLE_NAME]: chunk.map((template) => ({
                PutRequest: {
                  Item: template,
                },
              })),
            },
          })
        );
      })
    );
  }

  /**
   * Delete templates seeded by calls to seedTemplateData
   */
  public async deleteSeededTemplates() {
    await this.deleteTemplates(this.seedData);
    this.seedData = [];
  }

  /**
   * Stores references to templates created in tests (not via seeding)
   */
  public addAdHocTemplateKey(key: TemplateKey) {
    this.adHocTemplateKeys.push(key);
  }

  /**
   * Delete templates referenced by calls to addAdHocTemplateKey from database and associated files from s3
   */
  async deleteAdHocTemplates() {
    await this.deleteTemplates(this.adHocTemplateKeys);
    this.adHocTemplateKeys = [];
  }

  private async deleteTemplates(keys: TemplateKey[]) {
    const dbChunks = TemplateStorageHelper.chunk(keys);

    await Promise.all(
      dbChunks.map((chunk) =>
        this.ddbDocClient.send(
          new BatchWriteCommand({
            RequestItems: {
              [process.env.TEMPLATES_TABLE_NAME]: chunk.map(
                ({ id, owner }) => ({
                  DeleteRequest: {
                    Key: {
                      id,
                      owner,
                    },
                  },
                })
              ),
            },
          })
        )
      )
    );

    const owners = keys
      .map((key) => key.owner)
      .filter((owner, i, list) => list.indexOf(owner) === i);

    const files = await Promise.all(
      owners.map(async (owner) => {
        const pdfs = await this.s3.send(
          new ListObjectsV2Command({
            Bucket: process.env.TEMPLATES_INTERNAL_BUCKET_NAME,
            Prefix: `pdf-template/${owner}`,
          })
        );

        const csvs = await this.s3.send(
          new ListObjectsV2Command({
            Bucket: process.env.TEMPLATES_INTERNAL_BUCKET_NAME,
            Prefix: `test-data/${owner}`,
          })
        );

        return [...(pdfs.Contents || []), ...(csvs.Contents || [])];
      })
    );

    const s3Chunks = TemplateStorageHelper.chunk(files.flat(), 1000);

    await Promise.all(
      s3Chunks.map((chunk) =>
        this.s3.send(
          new DeleteObjectsCommand({
            Bucket: process.env.TEMPLATES_INTERNAL_BUCKET_NAME,
            Delete: {
              Objects: chunk.map(({ Key }) => ({ Key })),
            },
          })
        )
      )
    );
  }

  /**
   * Breaks a list into chunks of upto 25 items
   */
  private static chunk<T>(list: T[], size = 25): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < list.length; i += size) {
      chunks.push(list.slice(i, i + size));
    }

    return chunks;
  }

  /**
   * Retrieves a letter template pdf file from the internal bucket
   */
  async getScannedPdfTemplateFile(key: TemplateKey, version: string) {
    return await this.getLetterTemplateFile(
      process.env.TEMPLATES_INTERNAL_BUCKET_NAME,
      'pdf-template',
      key,
      version,
      'pdf'
    );
  }

  /**
   * Retrieves a letter template test data csv file from the internal bucket
   */
  async getScannedCsvTestDataFile(key: TemplateKey, version: string) {
    return await this.getLetterTemplateFile(
      process.env.TEMPLATES_INTERNAL_BUCKET_NAME,
      'test-data',
      key,
      version,
      'csv'
    );
  }

  /**
   * Retrieves a letter template pdf file from the quarantine bucket
   */
  async getQuarantinePdfTemplateFile(key: TemplateKey, version: string) {
    return await this.getLetterTemplateFile(
      process.env.TEMPLATES_QUARANTINE_BUCKET_NAME,
      'pdf-template',
      key,
      version,
      'pdf'
    );
  }

  /**
   * Retrieves a letter template test data csv file from the quarantine bucket
   */
  async getQuarantineCsvTestDataFile(key: TemplateKey, version: string) {
    return await this.getLetterTemplateFile(
      process.env.TEMPLATES_QUARANTINE_BUCKET_NAME,
      'test-data',
      key,
      version,
      'csv'
    );
  }

  /**
   * Retrieves a letter template file from s3
   */
  private async getLetterTemplateFile(
    bucket: string,
    prefix: string,
    key: TemplateKey,
    version: string,
    ext: string
  ) {
    try {
      return await this.s3.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: `${prefix}/${key.owner}/${key.id}/${version}.${ext}`,
          ChecksumMode: 'ENABLED',
        })
      );
    } catch (error) {
      if (error instanceof NotFound) {
        return null;
      }

      throw error;
    }
  }
}

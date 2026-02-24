import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  GetObjectCommand,
  HeadObjectCommand,
  NotFound,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';
import { Template } from '../types';

type TemplateKey = { clientId: string; templateId: string };

export class TemplateStorageHelper {
  private readonly clientOwnerPrefix = 'CLIENT#';

  private readonly ddbDocClient: DynamoDBDocumentClient =
    DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'eu-west-2' }));
  private readonly s3 = new S3Client({ region: 'eu-west-2' });

  private seedData: Template[] = [];

  private adHocTemplateKeys: TemplateKey[] = [];

  async getTemplate(key: TemplateKey): Promise<Template> {
    const { Item } = await this.ddbDocClient.send(
      new GetCommand({
        TableName: process.env.TEMPLATES_TABLE_NAME,
        Key: {
          id: key.templateId,
          owner: this.addClientOwnerPrefix(key.clientId),
        },
      })
    );

    return Item as Template;
  }

  /**
   * Get all templates from the database
   */
  async getAllTemplates(): Promise<Template[]> {
    const { ScanCommand } = await import('@aws-sdk/lib-dynamodb');

    const { Items } = await this.ddbDocClient.send(
      new ScanCommand({
        TableName: process.env.TEMPLATES_TABLE_NAME,
      })
    );

    return (Items as Template[]) || [];
  }

  /**
   * Delete templates from the database with optional filters
   * @param filters Optional filters to apply:
   *   - clientId: Only delete templates for a specific client
   *   - createdAfter: Only delete templates created on or after this date (ISO string or Date)
   *   - templateStatus: Only delete templates with a specific status
   * @returns Number of templates deleted
   */
  async deleteTemplates(filters?: {
    clientId?: string;
    createdAfter?: string | Date;
    templateStatus?: string;
  }): Promise<number> {
    let templatesToDelete = await this.getAllTemplates();

    if (filters) {
      if (filters.clientId) {
        templatesToDelete = templatesToDelete.filter(
          (template) => template.clientId === filters.clientId
        );
      }

      if (filters.createdAfter) {
        const targetDate =
          typeof filters.createdAfter === 'string'
            ? new Date(filters.createdAfter)
            : filters.createdAfter;
        templatesToDelete = templatesToDelete.filter((template) => {
          const createdAt = new Date(template.createdAt);
          return createdAt >= targetDate;
        });
      }

      if (filters.templateStatus) {
        templatesToDelete = templatesToDelete.filter(
          (template) => template.templateStatus === filters.templateStatus
        );
      }
    }

    if (templatesToDelete.length === 0) {
      return 0;
    }

    await this.delete(
      templatesToDelete.map(({ id, owner }) => ({
        id,
        owner,
      }))
    );

    return templatesToDelete.length;
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
    await this.delete(
      this.seedData.map(({ id, owner }) => ({
        id,
        owner,
      }))
    );
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
    await this.delete(
      this.adHocTemplateKeys.map(({ templateId, clientId }) => ({
        id: templateId,
        owner: this.addClientOwnerPrefix(clientId),
      }))
    );
    this.adHocTemplateKeys = [];
  }

  private async delete(keys: { id: string; owner: string }[]) {
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
   * Retrieves a rendered pdf from the download bucket
   */
  async getRenderFile(
    key: TemplateKey,
    renderType: 'initial',
    filename: string
  ) {
    return await this.getS3File(
      process.env.TEMPLATES_DOWNLOAD_BUCKET_NAME,
      `${key.clientId}/${key.templateId}/renders/${renderType}/${filename}`
    );
  }

  /**
   * Retrieves a letter template pdf file from the internal bucket
   */
  async getScannedPdfTemplateMetadata(key: TemplateKey, version: string) {
    return await this.getLetterTemplateMetadata(
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
  async getScannedCsvTestDataMetadata(key: TemplateKey, version: string) {
    return await this.getLetterTemplateMetadata(
      process.env.TEMPLATES_INTERNAL_BUCKET_NAME,
      'test-data',
      key,
      version,
      'csv'
    );
  }

  /**
   * Creates a letter template pdf file in the internal bucket
   */
  async putScannedPdfTemplateFile(
    key: TemplateKey,
    version: string,
    data: Buffer
  ) {
    return await this.putLetterTemplateFile(
      process.env.TEMPLATES_INTERNAL_BUCKET_NAME,
      'pdf-template',
      key,
      version,
      'pdf',
      data
    );
  }

  /**
   * Creates a letter template test data csv file in the internal bucket
   */
  async putScannedCsvTestDataFile(
    key: TemplateKey,
    version: string,
    data: Buffer
  ) {
    return await this.putLetterTemplateFile(
      process.env.TEMPLATES_INTERNAL_BUCKET_NAME,
      'test-data',
      key,
      version,
      'csv',
      data
    );
  }

  /**
   * Retrieves a letter template pdf file from the quarantine bucket
   */
  async getQuarantinePdfTemplateMetadata(key: TemplateKey, version: string) {
    return await this.getLetterTemplateMetadata(
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
  async getQuarantineCsvTestDataMetadata(key: TemplateKey, version: string) {
    return await this.getLetterTemplateMetadata(
      process.env.TEMPLATES_QUARANTINE_BUCKET_NAME,
      'test-data',
      key,
      version,
      'csv'
    );
  }

  /**
   * Adds a letter template file to s3
   */
  private async putLetterTemplateFile(
    bucket: string,
    prefix: string,
    key: TemplateKey,
    version: string,
    ext: string,
    data: Buffer,
    metadata?: Record<string, string>
  ) {
    return this.s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: this.letterInternalFileKey(prefix, key, version, ext),
        Body: data,
        Metadata: metadata,
      })
    );
  }

  /**
   * Retrieves a letter template file from s3
   */
  async getLetterTemplateMetadata(
    bucket: string,
    prefix: string,
    key: TemplateKey,
    version: string,
    ext: string
  ) {
    return await this.getS3Metadata(
      bucket,
      this.letterInternalFileKey(prefix, key, version, ext)
    );
  }

  async getLetterProofMetadata(
    bucket: string,
    prefix: string,
    supplier: string,
    templateId: string,
    version: string,
    ext: string
  ) {
    return await this.getS3Metadata(
      bucket,
      `${prefix}/${supplier}/${templateId}/${version}.${ext}`
    );
  }

  async getS3Metadata(bucket: string, key: string) {
    try {
      return await this.s3.send(
        new HeadObjectCommand({
          Bucket: bucket,
          Key: key,
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

  private async getS3File(bucket: string, key: string) {
    try {
      const response = await this.s3.send(
        new GetObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      );

      if (!response.Body) throw new Error('response.Body is absent');

      const byteArray = await response.Body.transformToByteArray();
      const buf = Buffer.from(byteArray);

      return { buffer: buf, metadata: response.Metadata };
    } catch (error) {
      if (error instanceof NotFound) {
        return null;
      }

      throw error;
    }
  }

  private letterInternalFileKey(
    prefix: string,
    key: TemplateKey,
    version: string,
    ext: string
  ) {
    return `${prefix}/${key.clientId}/${key.templateId}/${version}.${ext}`;
  }

  private addClientOwnerPrefix(owner: string) {
    return `${this.clientOwnerPrefix}${owner}`;
  }
}

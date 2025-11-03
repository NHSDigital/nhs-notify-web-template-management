import { SQSHandler } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({});

// Convert array of objects to CSV string.
export const objectsToCsv = (rows: Record<string, unknown>[]): string => {
  if (rows.length === 0) return '';

  // Collect union of keys preserving first-seen order.
  const headerSet: string[] = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!headerSet.includes(key)) headerSet.push(key);
    }
  }

  const escape = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = typeof val === 'string' ? val : JSON.stringify(val);
    const needsQuotes = /[",\n]/.test(str);
    const escaped = str.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const lines = [headerSet.join(',')];
  for (const row of rows) {
    lines.push(headerSet.map((h) => escape((row as any)[h])).join(','));
  }
  return lines.join('\n');
};

export const handler: SQSHandler = async (event) => {
  const bucket = process.env.BUCKET_NAME;
  if (!bucket) {
    throw new Error('BUCKET_NAME env var not set');
  }
  const prefix = process.env.KEY_PREFIX ?? '';

  const dataRows: Record<string, unknown>[] = [];

  for (const record of event.Records) {
    try {
      const payload: any = JSON.parse(record.body);
      if (payload && typeof payload === 'object' && payload.data && typeof payload.data === 'object') {
        dataRows.push(payload.data as Record<string, unknown>);
      }
    } catch (err) {
      console.warn('Skipping record - invalid JSON', err);
    }
  }

  if (dataRows.length === 0) return;

  const csv = objectsToCsv(dataRows);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const random = Math.random().toString(36).substring(2, 10);
  const key = `${prefix}${timestamp}-${random}.csv`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: csv,
      ContentType: 'text/csv'
    })
  );
};

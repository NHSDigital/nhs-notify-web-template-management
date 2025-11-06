import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { SQSEvent } from 'aws-lambda';
import { $MessageEnvelope } from './schema';
import { createContainer } from './container';

// RFC4180 CSV escaping & header union logic
function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return '';
  let str = typeof value === 'string' ? value : JSON.stringify(value);
  str = str.replace(/\r?\n/g, '\n'); // normalise line breaks
  const needsQuotes = /[",\n]/.test(str);
  str = str.replace(/"/g, '""');
  return needsQuotes ? `"${str}"` : str;
}

function buildCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const headerSet = new Set<string>();
  rows.forEach(r => Object.keys(r).forEach(k => headerSet.add(k)));
  const headers = Array.from(headerSet).sort();
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escapeCsv(row[h])).join(','));
  }
  return lines.join('\n');
}

export const createHandler = ({ s3Client }: { s3Client: S3Client }) => async (event: SQSEvent) => {
  const dataRows: Record<string, unknown>[] = [];
  let skipped = 0;
  for (const record of event.Records) {
    try {
      const json: unknown = JSON.parse(record.body);
      const parsed = $MessageEnvelope.safeParse(json);
      if (parsed.success) {
        dataRows.push(parsed.data.data);
      } else {
        skipped++;
      }
    } catch {
      skipped++;
    }
  }

  if (!dataRows.length) {
    return { status: 'no-data', skipped } as const;
  }

  const csv = buildCsv(dataRows);
  const bucket = process.env.EVENT_CSV_BUCKET_NAME;
  if (!bucket) throw new Error('EVENT_CSV_BUCKET_NAME not set');
  const timestamp = new Date().toISOString().replace(/[:]/g, '-');
  const key = `events/${timestamp}.csv`;

  await s3Client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: csv,
    ContentType: 'text/csv'
  }));

  return { status: 'ok', bucket, key, rows: dataRows.length, skipped } as const;
};

export const handler = createHandler(createContainer());

// Export internals for tests
export const _test = { buildCsv, escapeCsv, createHandler }; 

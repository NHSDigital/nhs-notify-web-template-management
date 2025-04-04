import type { SQSRecord } from 'aws-lambda';

export const handler = async (records: SQSRecord[]) => {
  console.log(records);
  throw new Error('ohno');
};

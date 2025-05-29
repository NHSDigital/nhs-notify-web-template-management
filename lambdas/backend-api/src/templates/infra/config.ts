import z from 'zod';

const $Env = z.object({
  DEFAULT_LETTER_SUPPLIER: z.string(),
  ENABLE_PROOFING: z.enum(['true', 'false']).default('false'),
  ENVIRONMENT: z.string(),
  REQUEST_PROOF_QUEUE_URL: z.string(),
  TEMPLATES_INTERNAL_BUCKET_NAME: z.string(),
  TEMPLATES_QUARANTINE_BUCKET_NAME: z.string(),
  TEMPLATES_DOWNLOAD_BUCKET_NAME: z.string(),
  TEMPLATES_TABLE_NAME: z.string(),
});

export function loadConfig() {
  const env = $Env.parse(process.env);

  return {
    defaultLetterSupplier: env.DEFAULT_LETTER_SUPPLIER,
    enableProofing: env.ENABLE_PROOFING === 'true',
    environment: env.ENVIRONMENT,
    internalBucket: env.TEMPLATES_INTERNAL_BUCKET_NAME,
    quarantineBucket: env.TEMPLATES_QUARANTINE_BUCKET_NAME,
    downloadBucket: env.TEMPLATES_DOWNLOAD_BUCKET_NAME,
    requestProofQueueUrl: env.REQUEST_PROOF_QUEUE_URL,
    templatesTableName: env.TEMPLATES_TABLE_NAME,
  };
}

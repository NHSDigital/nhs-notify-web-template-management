import { z } from 'zod/v4';

const $Env = z.object({
  CLIENT_CONFIG_SSM_KEY_PREFIX: z.string(),
  CLIENT_CONFIG_TTL_SECONDS: z.string().pipe(z.coerce.number()),
  DEFAULT_LETTER_SUPPLIER: z.string(),
  ENVIRONMENT: z.string(),
  REQUEST_PROOF_QUEUE_URL: z.string(),
  TEMPLATES_INTERNAL_BUCKET_NAME: z.string(),
  TEMPLATES_QUARANTINE_BUCKET_NAME: z.string(),
  TEMPLATES_DOWNLOAD_BUCKET_NAME: z.string(),
  TEMPLATES_TABLE_NAME: z.string(),
  TEMPLATE_SUBMITTED_SENDER_EMAIL_ADDRESS: z.string(),
  SUPPLIER_RECIPIENT_EMAIL_ADDRESSES: z.string(),
});

export function loadConfig() {
  const env = $Env.parse(process.env);

  const supplierRecipientEmailAddresses = z
    .record(z.string(), z.array(z.string().email()))
    .parse(JSON.parse(env.SUPPLIER_RECIPIENT_EMAIL_ADDRESSES));

  return {
    clientConfigSsmKeyPrefix: env.CLIENT_CONFIG_SSM_KEY_PREFIX,
    clientConfigTtlSeconds: env.CLIENT_CONFIG_TTL_SECONDS,
    defaultLetterSupplier: env.DEFAULT_LETTER_SUPPLIER,
    environment: env.ENVIRONMENT,
    internalBucket: env.TEMPLATES_INTERNAL_BUCKET_NAME,
    quarantineBucket: env.TEMPLATES_QUARANTINE_BUCKET_NAME,
    downloadBucket: env.TEMPLATES_DOWNLOAD_BUCKET_NAME,
    requestProofQueueUrl: env.REQUEST_PROOF_QUEUE_URL,
    templatesTableName: env.TEMPLATES_TABLE_NAME,
    templateSubmittedSenderEmailAddress:
      env.TEMPLATE_SUBMITTED_SENDER_EMAIL_ADDRESS,
    supplierRecipientEmailAddresses,
  };
}

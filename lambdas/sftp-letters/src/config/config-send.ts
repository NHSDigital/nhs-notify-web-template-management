import z from 'zod';

const $Env = z.object({
  CREDENTIALS_TTL_SECONDS: z.string().pipe(z.coerce.number()),
  CSI: z.string(),
  INTERNAL_BUCKET_NAME: z.string(),
  REGION: z.string(),
  SEND_LOCK_TTL_MS: z.string().pipe(z.coerce.number()),
  SFTP_ENVIRONMENT: z.string(),
  TEMPLATES_TABLE_NAME: z.string(),
  PROOF_REQUESTED_SENDER_EMAIL_ADDRESS: z.string(),
  SUPPLIER_RECIPIENT_EMAIL_ADDRESSES: z.string(),
});

export function loadConfig() {
  const env = $Env.parse(process.env);

  const supplierRecipientEmailAddresses = z
    .record(z.string(), z.array(z.string().email()))
    .parse(JSON.parse(env.SUPPLIER_RECIPIENT_EMAIL_ADDRESSES));

  return {
    credentialsTtlSeconds: env.CREDENTIALS_TTL_SECONDS,
    csi: env.CSI,
    internalBucketName: env.INTERNAL_BUCKET_NAME,
    region: env.REGION,
    sendLockTtlMs: env.SEND_LOCK_TTL_MS,
    sftpEnvironment: env.SFTP_ENVIRONMENT,
    templatesTableName: env.TEMPLATES_TABLE_NAME,
    proofRequestedSenderEmailAddress: env.PROOF_REQUESTED_SENDER_EMAIL_ADDRESS,
    supplierRecipientEmailAddresses,
  };
}

export type Config = ReturnType<typeof loadConfig>;

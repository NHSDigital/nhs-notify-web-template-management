import z from 'zod';

export function loadConfig() {
  return z
    .object({
      CREDENTIALS_TTL_MS: z.string().pipe(z.coerce.number()),
      CSI: z.string(),
      DEFAULT_LETTER_SUPPLIER: z.string(),
      INTERNAL_BUCKET_NAME: z.string(),
      REGION: z.string(),
      SEND_LOCK_TTL_MS: z.string().pipe(z.coerce.number()),
      SFTP_ENVIRONMENT: z.string(),
      TEMPLATES_TABLE_NAME: z.string(),
    })
    .transform((e) => ({
      credentialsTtlMs: e.CREDENTIALS_TTL_MS,
      csi: e.CSI,
      defaultSupplier: e.DEFAULT_LETTER_SUPPLIER,
      internalBucketName: e.INTERNAL_BUCKET_NAME,
      region: e.REGION,
      sendLockTtlMs: e.SEND_LOCK_TTL_MS,
      sftpEnvironment: e.SFTP_ENVIRONMENT,
      templatesTableName: e.TEMPLATES_TABLE_NAME,
    }))
    .parse(process.env);
}

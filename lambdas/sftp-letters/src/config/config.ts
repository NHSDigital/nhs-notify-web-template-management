import z from 'zod';

export function loadConfig() {
  return z
    .object({
      CSI: z.string(),
      ENVIRONMENT: z.string(),
      TEMPLATES_TABLE_NAME: z.string(),
      INTERNAL_BUCKET_NAME: z.string(),
      DEFAULT_LETTER_SUPPLIER: z.string(),
      SFTP_ENVIRONMENT: z.string(),
      REGION: z.string(),
    })
    .transform((e) => ({
      csi: e.CSI,
      internalBucketName: e.INTERNAL_BUCKET_NAME,
      defaultSupplier: e.DEFAULT_LETTER_SUPPLIER,
      sftpEnvironment: e.SFTP_ENVIRONMENT,
      region: e.REGION,
      templatesTableName: e.TEMPLATES_TABLE_NAME,
    }))
    .parse(process.env);
}

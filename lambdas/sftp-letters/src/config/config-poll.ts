import z from 'zod';

export function loadConfig() {
  return z
    .object({
      CREDENTIALS_TTL_SECONDS: z.string().pipe(z.coerce.number()),
      CSI: z.string(),
      QUARANTINE_BUCKET_NAME: z.string(),
      REGION: z.string(),
      SFTP_ENVIRONMENT: z.string(),
    })
    .transform((e) => ({
      credentialsTtlSeconds: e.CREDENTIALS_TTL_SECONDS,
      csi: e.CSI,
      quarantineBucketName: e.QUARANTINE_BUCKET_NAME,
      region: e.REGION,
      sftpEnvironment: e.SFTP_ENVIRONMENT,
    }))
    .parse(process.env);
}

export type Config = ReturnType<typeof loadConfig>;

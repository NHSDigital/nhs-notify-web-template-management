import z from 'zod/v4';

export function loadConfig() {
  return z
    .object({
      DOWNLOAD_BUCKET_NAME: z.string(),
      INTERNAL_BUCKET_NAME: z.string(),
      REGION: z.string(),
      TEMPLATES_TABLE_NAME: z.string(),
    })
    .parse(process.env);
}

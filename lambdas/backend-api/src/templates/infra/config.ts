import z from 'zod';

const $Env = z.object({
  ENABLE_LETTERS_BACKEND: z.enum(['true', 'false']).default('false'),
  ENVIRONMENT: z.string(),
  TEMPLATES_QUARANTINE_BUCKET_NAME: z.string(),
  TEMPLATES_INTERNAL_BUCKET_NAME: z.string(),
  TEMPLATES_TABLE_NAME: z.string(),
});

export function loadConfig() {
  const env = $Env.parse(process.env);

  return {
    enableLetters: env.ENABLE_LETTERS_BACKEND === 'true',
    environment: env.ENVIRONMENT,
    internalBucket: env.TEMPLATES_INTERNAL_BUCKET_NAME,
    quarantineBucket: env.TEMPLATES_QUARANTINE_BUCKET_NAME,
    templatesTableName: env.TEMPLATES_TABLE_NAME,
  };
}

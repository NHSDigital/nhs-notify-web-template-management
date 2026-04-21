import { z } from 'zod';

const $Config = z.object({
  EVENT_SOURCE: z.string(),
  ROUTING_CONFIG_TABLE_NAME: z.string(),
  SNS_TOPIC_ARN: z.string(),
  TEMPLATES_TABLE_NAME: z.string(),
  PROOF_REQUESTS_TABLE_NAME: z.string(),
  INTERNAL_BUCKET_NAME: z.string(),
  SHARED_FILES_BUCKET_NAME: z.string(),
  SHARED_FILES_BUCKET_PREFIX: z.string(),
});

export const loadConfig = () => {
  return $Config.parse(process.env);
};

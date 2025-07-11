import { z } from 'zod';

const $Config = z.object({
  TEMPLATES_TABLE_NAME: z.string(),
  SNS_TOPIC_ARN: z.string(),
  EVENT_SOURCE: z.string(),
});

export const loadConfig = () => {
  return $Config.parse(process.env);
};

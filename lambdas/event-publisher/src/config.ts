import { z } from 'zod';

const $Config = z.object({
  EVENT_SOURCE: z.string(),
  ROUTING_CONFIG_TABLE_NAME: z.string(),
  SNS_TOPIC_ARN: z.string(),
  TEMPLATES_TABLE_NAME: z.string(),
});

export const loadConfig = () => {
  return $Config.parse(process.env);
};

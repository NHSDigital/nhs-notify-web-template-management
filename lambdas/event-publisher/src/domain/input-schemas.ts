import { z } from 'zod';
import type { AttributeValue } from '@aws-sdk/client-dynamodb';
import {
  RoutingConfig,
  schemaFor,
  TEMPLATE_STATUS_LIST,
  TEMPLATE_TYPE_LIST,
  ROUTING_CONFIG_STATUS_LIST,
} from 'nhs-notify-backend-client';
import type { DatabaseTemplate } from 'nhs-notify-web-template-management-utils';

const $AttributeValue: z.ZodType<AttributeValue> = z.lazy(() =>
  z.union([
    z.object({ S: z.string() }),
    z.object({ N: z.string() }),
    z.object({ BOOL: z.boolean() }),
    z.object({ NULL: z.literal(true) }),
    z.object({ B: z.instanceof(Uint8Array) }),
    z.object({ SS: z.array(z.string()) }),
    z.object({ NS: z.array(z.string()) }),
    z.object({ BS: z.array(z.instanceof(Uint8Array)) }),
    z.object({ L: z.array($AttributeValue) }),
    z.object({ M: z.record(z.string(), $AttributeValue) }),
  ])
);

export const $DynamoDBStreamRecord = z.object({
  eventID: z.string(),
  dynamodb: z.object({
    NewImage: z.record(z.string(), $AttributeValue).optional(),
    OldImage: z.record(z.string(), $AttributeValue).optional(),
    SequenceNumber: z.string().optional(),
  }),
  tableName: z.string(),
});

// We need a subset of the database fields so we can apply filtering rules
export const $DynamoDBTemplate = schemaFor<Partial<DatabaseTemplate>>()(
  z.object({
    id: z.string(),
    templateType: z.enum(TEMPLATE_TYPE_LIST),
    templateStatus: z.enum(TEMPLATE_STATUS_LIST),
    proofingEnabled: z.boolean().optional(),
  })
);
export type DynamoDBTemplate = z.infer<typeof $DynamoDBTemplate>;

export const $DynamoDBRoutingConfig = schemaFor<Partial<RoutingConfig>>()(
  z.object({
    id: z.string(),
    status: z.enum(ROUTING_CONFIG_STATUS_LIST),
  })
);
export type DynamoDBRoutingConfig = z.infer<typeof $DynamoDBRoutingConfig>;

// the lambda doesn't necessarily have to only accept inputs from a dynamodb stream via an
// eventbridge pipe, but that's all it is doing at the moment
export const $PublishableEventRecord = $DynamoDBStreamRecord;
export type PublishableEventRecord = z.infer<typeof $PublishableEventRecord>;

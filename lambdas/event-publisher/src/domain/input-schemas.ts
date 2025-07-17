import { z } from 'zod';
import { AttributeValue } from '@aws-sdk/client-dynamodb';

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
    SequenceNumber: z.string().optional(),
  }),
  tableName: z.string(),
});

// the lambda doesn't necessarily have to only accept inputs from a dynamodb stream via an
// eventbridge pipe, but that's all it is doing at the moment
export const $PublishableEventRecord = $DynamoDBStreamRecord;
export type PublishableEventRecord = z.infer<typeof $PublishableEventRecord>;

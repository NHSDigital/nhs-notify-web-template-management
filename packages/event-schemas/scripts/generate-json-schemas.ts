/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';
import path from 'node:path';
import {
  $TemplateCompletedEventV1,
  $TemplateDeletedEventV1,
  $TemplateDraftedEventV1,
  $RoutingConfigCompletedEventV1,
  $RoutingConfigDeletedEventV1,
  $RoutingConfigDraftedEventV1,
} from '../src';
import { toJSONSchema, type ZodType } from 'zod';
import { JSONSchema } from 'zod/v4/core';

const removeIdFieldFromDefs = (
  jsonSchema: JSONSchema.JSONSchema
): JSONSchema.JSONSchema => {
  const defs = jsonSchema.$defs ?? {};

  const newDefs = Object.entries(defs).map(([key, value]) => {
    const { id: _, ...rest } = value;

    return [key, rest];
  });

  return {
    ...jsonSchema,
    $defs: Object.fromEntries(newDefs),
  };
};

// Converts Zod Schema to JSON Schema and writes to JSON file
function writeSchema(
  name: string,
  schema: ZodType,
  majorVersion: string,
  id: string
) {
  const outDir = path.resolve(__dirname, '..', 'schemas', name);
  fs.mkdirSync(outDir, { recursive: true });

  const jsonSchema = toJSONSchema(schema, { io: 'input' });

  const outPath = path.resolve(outDir, `v${majorVersion}.json`);
  fs.writeFileSync(
    outPath,
    `${JSON.stringify(
      {
        ...removeIdFieldFromDefs(jsonSchema),
        $id: id,
      },
      null,
      2
    )}\n`
  );
}

writeSchema(
  'TemplateCompleted',
  $TemplateCompletedEventV1,
  '1',
  'https://notify.nhs.uk/events/schemas/TemplateCompleted/v1.json'
);
writeSchema(
  'TemplateDeleted',
  $TemplateDeletedEventV1,
  '1',
  'https://notify.nhs.uk/events/schemas/TemplateDeleted/v1.json'
);
writeSchema(
  'TemplateDrafted',
  $TemplateDraftedEventV1,
  '1',
  'https://notify.nhs.uk/events/schemas/TemplateDrafted/v1.json'
);

writeSchema(
  'RoutingConfigCompleted',
  $RoutingConfigCompletedEventV1,
  '1',
  'https://notify.nhs.uk/events/schemas/RoutingConfigCompleted/v1.json'
);
writeSchema(
  'RoutingConfigDeleted',
  $RoutingConfigDeletedEventV1,
  '1',
  'https://notify.nhs.uk/events/schemas/RoutingConfigDeleted/v1.json'
);
writeSchema(
  'RoutingConfigDrafted',
  $RoutingConfigDraftedEventV1,
  '1',
  'https://notify.nhs.uk/events/schemas/RoutingConfigDrafted/v1.json'
);

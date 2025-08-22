/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';
import path from 'node:path';
import {
  $TemplateCompletedEventV1,
  $TemplateDeletedEventV1,
  $TemplateDraftedEventV1,
} from '../src';
import { toJSONSchema, type ZodType } from 'zod';

// Converts Zod Schema to JSON Schema and writes to JSON file
function writeSchema(name: string, schema: ZodType, majorVersion: string) {
  const outDir = path.resolve(__dirname, '..', 'schemas', name);
  fs.mkdirSync(outDir, { recursive: true });

  const jsonSchema = toJSONSchema(schema, { io: 'input' });
  const outPath = path.resolve(outDir, `v${majorVersion}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify(jsonSchema, null, 2)}\n`);
}

writeSchema('TemplateCompleted', $TemplateCompletedEventV1, '1');
writeSchema('TemplateDeleted', $TemplateDeletedEventV1, '1');
writeSchema('TemplateDrafted', $TemplateDraftedEventV1, '1');

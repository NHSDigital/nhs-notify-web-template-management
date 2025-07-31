/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';
import path from 'node:path';
import {
  $TemplateCompletedEvent,
  $TemplateDeletedEvent,
  $TemplateDraftedEvent,
} from '../src';
import { toJSONSchema, type ZodType } from 'zod';

// Converts Zod Schema to JSON Schema and writes to JSON file
function writeSchema(name: string, schema: ZodType) {
  const outDir = path.resolve(__dirname, '..', 'schemas');
  fs.mkdirSync(outDir, { recursive: true });

  const jsonSchema = toJSONSchema(schema, { io: 'input' });
  const outPath = path.resolve(outDir, `${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(jsonSchema, null, 2));
}

writeSchema('TemplateCompleted', $TemplateCompletedEvent);
writeSchema('TemplateDeleted', $TemplateDeletedEvent);
writeSchema('TemplateDrafted', $TemplateDraftedEvent);

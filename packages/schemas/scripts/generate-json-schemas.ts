import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { $TemplateCompletedEvent, $TemplateDeletedEvent, $TemplateDraftedEvent } from '../src'
import { toJSONSchema, type ZodType } from 'zod';

// Converts Zod Schema to JSON Schema and writes to JSON file
function writeSchema(name: string, schema: ZodType) {
  const outDir = resolve('dist', 'event-schemas');
  mkdirSync(outDir, { recursive: true });

  const jsonSchema = toJSONSchema(schema);
  const outPath = resolve(outDir, `${name}.json`);
  writeFileSync(outPath, JSON.stringify(jsonSchema, null, 2));
}

writeSchema('TemplateCompleted', $TemplateCompletedEvent);
writeSchema('TemplateDeleted', $TemplateDeletedEvent);
writeSchema('TemplateDrafted', $TemplateDraftedEvent);

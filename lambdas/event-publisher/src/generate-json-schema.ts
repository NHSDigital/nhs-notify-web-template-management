import { writeFileSync, mkdirSync } from 'node:fs';
import { $TemplateCompletedEvent } from './domain/individual-event-schemas/template-completed';
import { $TemplateDeletedEvent } from './domain/individual-event-schemas/template-deleted';
import { $TemplateDraftedEvent } from './domain/individual-event-schemas/template-drafted';

import { toJSONSchema } from 'zod';

mkdirSync('./json-schemas');

const templateCompletedJsonSchema = toJSONSchema($TemplateCompletedEvent);
writeFileSync(
  './json-schemas/template-completed.json',
  JSON.stringify(templateCompletedJsonSchema, null, 2)
);

const templateDraftedJsonSchema = toJSONSchema($TemplateDraftedEvent);
writeFileSync(
  './json-schemas/template-drafted.json',
  JSON.stringify(templateDraftedJsonSchema, null, 2)
);

const templateDeletedJsonSchema = toJSONSchema($TemplateDeletedEvent);
writeFileSync(
  './json-schemas/template-deleted.json',
  JSON.stringify(templateDeletedJsonSchema, null, 2)
);

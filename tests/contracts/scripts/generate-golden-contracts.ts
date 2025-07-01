import fs from 'node:fs';
import path from 'node:path';
import $RefParser from "@apidevtools/json-schema-ref-parser"; // eslint-disable-line import/no-extraneous-dependencies
import { zodToJsonSchema } from 'zod-to-json-schema'; // eslint-disable-line import/no-extraneous-dependencies
import { $TemplateDeletedEvent } from '../src/templates/events/template-deleted.event';
import { $UserCreatedEvent } from '../src/auth/events/user-created.event';

(async function main() {

  // Create template service golden contracts
  const templateSchemasPath = path.resolve(
    __dirname,
    '../src/templates/events/.schemas'
  );
  fs.mkdirSync(templateSchemasPath, { recursive: true });

  const TemplateDeletedSchema = zodToJsonSchema(
    $TemplateDeletedEvent,
    'TemplateDeletedEvent',
  );
  const templateDeletedPath = path.join(
    templateSchemasPath,
    'TemplateDeleted.schema.json'
  );
  fs.writeFileSync(
    templateDeletedPath,
    JSON.stringify(await $RefParser.dereference(TemplateDeletedSchema), null, 2)
  );
  console.log('Created JSONSchema file at', templateDeletedPath);

  // Create auth service golden contracts
  const authSchemasPath = path.resolve(__dirname, '../src/auth/events/.schemas');
  fs.mkdirSync(authSchemasPath, { recursive: true });

  const UserCreatedSchema = zodToJsonSchema(
    $UserCreatedEvent,
    'UserCreatedEvent',
  );

  const userCreatedPath = path.join(authSchemasPath, 'UserCreated.schema.json');
  fs.writeFileSync(userCreatedPath, JSON.stringify(await $RefParser.dereference(UserCreatedSchema), null, 2));
  console.log('Created JSONSchema file at', userCreatedPath);
})();

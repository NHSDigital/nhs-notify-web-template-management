/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';
import path from 'node:path';
import { Ajv2020 } from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

import TemplateDraftedEventV1Schema from '../../schemas/TemplateDrafted/v1.json';

const examplesDir = path.resolve(
  __dirname,
  '../../examples/TemplateDrafted/v1'
);

describe('TemplateDraftedEventV1 JSON schema', () => {
  it.each(fs.readdirSync(examplesDir))(
    'parses sample event %s without errors',
    (filename) => {
      const event = JSON.parse(
        fs.readFileSync(path.join(examplesDir, filename), 'utf8')
      );

      const ajv = new Ajv2020();
      addFormats(ajv);
      const validate = ajv.compile(TemplateDraftedEventV1Schema);

      const valid = validate(event);

      if (!valid) {
        console.log(validate.errors);
      }

      expect(valid).toBe(true);
    }
  );
});

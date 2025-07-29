import fs from 'node:fs';
import path from 'node:path';
import { $TemplateCompletedEvent } from '../../src/events/TemplateCompleted';

const examplesDir = path.resolve(
  __dirname,
  '../../sample-events/TemplateCompleted'
);

describe('TemplateCompletedEvent schema', () => {
  it.each(fs.readdirSync(examplesDir))(
    'parses sample event %s without errors',
    (filename) => {
      const event = JSON.parse(
        fs.readFileSync(path.join(examplesDir, filename), 'utf8')
      );

      const result = $TemplateCompletedEvent.safeParse(event);

      if (!result.success) {
        console.log(result.error);
      }

      expect(result.success).toBe(true);
    }
  );
});

/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';
import path from 'node:path';
import { $ProofRequestedEventV1 } from '../../src/events/proof-requested';

const examplesDir = path.resolve(__dirname, '../../examples/ProofRequested/v1');

describe('ProofRequestedEventV1 Zod schema', () => {
  it.each(fs.readdirSync(examplesDir))(
    'parses sample event %s without errors',
    (filename) => {
      const event = JSON.parse(
        fs.readFileSync(path.join(examplesDir, filename), 'utf8')
      );

      const result = $ProofRequestedEventV1.safeParse(event);

      if (!result.success) {
        console.log(result.error);
      }

      expect(result.success).toBe(true);
    }
  );

  it('fails when SMS proof request does not include contactDetails.sms', () => {
    const smsEvent = JSON.parse(
      fs.readFileSync(path.join(examplesDir, 'sms.json'), 'utf8')
    );

    delete smsEvent.data.contactDetails.sms;

    const result = $ProofRequestedEventV1.safeParse(smsEvent);

    expect(result.success).toBe(false);
  });

  it('fails when EMAIL proof request does not include contactDetails.email', () => {
    const emailEvent = JSON.parse(
      fs.readFileSync(path.join(examplesDir, 'email.json'), 'utf8')
    );

    delete emailEvent.data.contactDetails.email;

    const result = $ProofRequestedEventV1.safeParse(emailEvent);

    expect(result.success).toBe(false);
  });
});

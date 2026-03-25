/* eslint-disable security/detect-non-literal-fs-filename */

import fs from 'node:fs';
import path from 'node:path';
import { $ProofRequestedEventV1 } from '../../src/events/proof-requested';

const examplesDir = path.resolve(__dirname, '../../examples/ProofRequested/v1');

const createEvent = (type, contactDetails) => ({
  data: {
    id: 'c3d4e5f6-a7b8-4012-8def-123456789012',
    templateId: '8c7ae592-97cd-4900-897e-ef4794c8a745',
    templateType: type,
    testPatientNhsNumber: '9000000009',
    contactDetails: contactDetails,
    personalisation: {
      firstName: 'Jane',
      surgeryName: 'Test Surgery',
    },
  },
  datacontenttype: 'application/json',
  dataschema: 'https://notify.nhs.uk/events/schemas/ProofRequested/v1.json',
  dataschemaversion: '1.0.0',
  id: 'b3c4d5e6-f7a8-9012-bcde-f12345678902',
  plane: 'data',
  source: '//notify.nhs.uk/app/nhs-notify-template-management-prod/main',
  specversion: '1.0',
  subject: 'c3d4e5f6-a7b8-4012-8def-123456789012',
  time: '2025-07-29T10:05:45.145Z',
  type: 'uk.nhs.notify.template-management.ProofRequested.v1',
});

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

  test.each([
    ['SMS', { sms: undefined }],
    ['EMAIL', { email: undefined }],
  ])(
    'fails when %s ProofRequestedEventV1 contactDetails has %s',
    (type, contactDetails) => {
      const event = createEvent(type, contactDetails);

      const { error, success } = $ProofRequestedEventV1.safeParse(event);

      expect(success).toBe(false);

      expect(error).toBeDefined();

      expect(error!.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            expected: 'string',
            code: 'invalid_type',
            path: ['data', 'contactDetails', type.toLowerCase()],
            message: 'Invalid input: expected string, received undefined',
          }),
        ])
      );
    }
  );
});

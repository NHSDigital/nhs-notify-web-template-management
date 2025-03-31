import path from 'node:path';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  PactV3,
  MatchersV3,
  SpecificationVersion,
} from '@pact-foundation/pact';

import { templateClient } from 'nhs-notify-backend-client/src/template-api-client';

const { like } = MatchersV3;

const provider = new PactV3({
  consumer: 'TemplateClient',
  provider: 'TemplateService',
  // log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  logLevel: 'warn',
  dir: path.resolve(process.cwd(), 'pacts'),
  spec: SpecificationVersion.SPECIFICATION_VERSION_V2,
  host: '127.0.0.1',
  port: 8080,
});

const testToken = 'abc';
process.env.API_BASE_URL = 'http://127.0.0.1:8080';
describe('API Pact test', () => {
  describe('getting all templates', () => {
    test('templates exists', async () => {
      // set up Pact interactions
      await provider.addInteraction({
        states: [{ description: 'templates exist' }],
        uponReceiving: 'get all templates',
        withRequest: {
          method: 'GET',
          path: '/v1/templates',
          headers: {
            Authorization: like('Bearer 2019-01-14T11:34:18.045Z'),
          },
        },

        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: like({
            templates: [
              {
                id: 'id',
                name: 'name',
                message: 'message',
                templateStatus: 'SUBMITTED',
                templateType: 'NHS_APP',
              },
            ],
          }),
        },
      });

      await provider.executeTest(async (_) => {
        // make request to Pact mock server
        const templates = await templateClient.listTemplates(testToken);
        expect(templates.data?.[0]).toStrictEqual({
          id: 'id',
          name: 'name',
          message: 'message',
          templateStatus: 'SUBMITTED',
          templateType: 'NHS_APP',
        });
      });
    });
  });

  describe('getting one template', () => {
    test('ID 10 exists', async () => {
      // set up Pact interactions
      await provider.addInteraction({
        states: [{ description: 'template  with ID 10 exists' }],
        uponReceiving: 'get template with ID 10',
        withRequest: {
          method: 'GET',
          path: '/v1/template/10',
          headers: {
            Authorization: like('Bearer 2019-01-14T11:34:18.045Z'),
          },
        },
        willRespondWith: {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
          },
          body: like({
            template: {
              id: 'id',
              name: 'name',
              message: 'message',
              templateStatus: 'NOT_YET_SUBMITTED',
              templateType: 'NHS_APP',
            },
          }),
        },
      });

      await provider.executeTest(async (_) => {
        // make request to Pact mock server
        const response = await templateClient.getTemplate('10', testToken);

        expect(response.data).toStrictEqual({
          id: 'id',
          name: 'name',
          message: 'message',
          templateStatus: 'NOT_YET_SUBMITTED',
          templateType: 'NHS_APP',
        });
      });
    });
  });
});

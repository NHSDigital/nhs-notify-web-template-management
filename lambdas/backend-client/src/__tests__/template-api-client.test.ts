import MockAdapter from 'axios-mock-adapter';
import type { LetterVariant } from 'nhs-notify-web-template-management-types';
import {
  templateApiClient as client,
  httpClient,
} from '../template-api-client';

let axiosMock: MockAdapter;

const testToken = 'abc';

describe('TemplateAPIClient', () => {
  beforeEach(() => {
    axiosMock = new MockAdapter(httpClient);
  });

  test('createTemplate - should return error', async () => {
    axiosMock.onPost('/v1/template').reply(400, {
      statusCode: 400,
      technicalMessage: 'Bad request',
      details: {
        message: 'Contains invalid characters',
      },
    });

    const result = await client.createTemplate(
      {
        name: 'test',
        message: '<html></html>',
        templateType: 'NHS_APP',
      },
      testToken
    );

    expect(result.error).toEqual({
      errorMeta: {
        code: 400,
        description: 'Bad request',
        details: {
          message: 'Contains invalid characters',
        },
      },
    });

    expect(result.data).toBeUndefined();

    expect(axiosMock.history.post.length).toBe(1);
  });

  test('createTemplate - should return template', async () => {
    axiosMock.onPost('/v1/template').reply(201, {
      statusCode: 201,
      data: {
        id: 'id',
        name: 'name',
        message: 'message',
        templateType: 'NHS_APP',
      },
    });

    const result = await client.createTemplate(
      {
        name: 'name',
        message: 'message',
        templateType: 'NHS_APP',
      },
      testToken
    );

    expect(result.data).toEqual({
      id: 'id',
      name: 'name',
      message: 'message',
      templateType: 'NHS_APP',
    });

    expect(result.error).toBeUndefined();
  });

  test('uploadLetterTemplate - should return error', async () => {
    axiosMock.onPost('/v1/letter-template').reply(400, {
      statusCode: 400,
      technicalMessage: 'Bad request',
      details: {
        message: 'Invalid request',
      },
    });

    const result = await client.uploadLetterTemplate(
      {
        name: 'test',
        templateType: 'LETTER',
        language: 'de',
        letterType: 'x1',
        campaignId: 'campaign-id',
        letterVersion: 'PDF',
      },
      testToken,
      new File(['pdf'], 'template.pdf', { type: 'application/pdf' })
    );

    expect(result.error).toEqual({
      errorMeta: {
        code: 400,
        description: 'Bad request',
        details: {
          message: 'Invalid request',
        },
      },
    });

    expect(result.data).toBeUndefined();

    expect(axiosMock.history.post.length).toBe(1);
  });

  test('uploadLetterTemplate - should return template', async () => {
    axiosMock.onPost('/v1/letter-template').reply(201, {
      statusCode: 201,
      data: {
        id: 'id',
        name: 'test',
        templateType: 'LETTER',
        language: 'de',
        letterType: 'x1',
        files: {
          pdfTemplate: {
            fileName: 'template.pdf',
            currentVersion: '32ADDAB01170',
            virusScanStatus: 'PENDING',
          },
          testDataCsv: {
            fileName: 'test-data.csv',
            currentVersion: 'DAB2A04B66FD',
            virusScanStatus: 'PENDING',
          },
        },
      },
    });

    const result = await client.uploadLetterTemplate(
      {
        name: 'test',
        templateType: 'LETTER',
        language: 'de',
        letterType: 'x1',
        campaignId: 'campaign-id',
        letterVersion: 'PDF',
      },
      testToken,
      new File(['pdf'], 'template.pdf', { type: 'application/pdf' }),
      new File(['csv'], 'test-data.csv', { type: 'test/csv' })
    );

    expect(result.data).toEqual({
      id: 'id',
      name: 'test',
      templateType: 'LETTER',
      language: 'de',
      letterType: 'x1',
      files: {
        pdfTemplate: {
          fileName: 'template.pdf',
          currentVersion: '32ADDAB01170',
          virusScanStatus: 'PENDING',
        },
        testDataCsv: {
          fileName: 'test-data.csv',
          currentVersion: 'DAB2A04B66FD',
          virusScanStatus: 'PENDING',
        },
      },
    });

    expect(result.error).toBeUndefined();
  });

  test('uploadDocxTemplate - should return error', async () => {
    axiosMock.onPost('/v1/docx-letter-template').reply(400, {
      statusCode: 400,
      technicalMessage: 'Bad request',
      details: {
        message: 'Invalid request',
      },
    });

    const result = await client.uploadDocxTemplate(
      {
        name: 'test',
        templateType: 'LETTER',
        language: 'de',
        letterType: 'x1',
        campaignId: 'campaign-id',
        letterVersion: 'AUTHORING',
      },
      testToken,
      new File(['docxTemplate'], 'template.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
    );

    expect(result.error).toEqual({
      errorMeta: {
        code: 400,
        description: 'Bad request',
        details: {
          message: 'Invalid request',
        },
      },
    });

    expect(result.data).toBeUndefined();

    expect(axiosMock.history.post.length).toBe(1);
  });

  test('uploadDocxTemplate - should return template', async () => {
    axiosMock.onPost('/v1/docx-letter-template').reply(201, {
      statusCode: 201,
      data: {
        id: 'id',
        name: 'test',
        templateType: 'LETTER',
        language: 'de',
        letterType: 'x1',
        files: {
          docxTemplate: {
            fileName: 'template.docx',
            currentVersion: '32ADDAB01170',
            virusScanStatus: 'PENDING',
          },
        },
      },
    });

    const result = await client.uploadDocxTemplate(
      {
        name: 'test',
        templateType: 'LETTER',
        language: 'de',
        letterType: 'x1',
        campaignId: 'campaign-id',
        letterVersion: 'PDF',
      },
      testToken,
      new File(['docxTemplate'], 'template.docx', {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
    );

    expect(result.data).toEqual({
      id: 'id',
      name: 'test',
      templateType: 'LETTER',
      language: 'de',
      letterType: 'x1',
      files: {
        docxTemplate: {
          fileName: 'template.docx',
          currentVersion: '32ADDAB01170',
          virusScanStatus: 'PENDING',
        },
      },
    });

    expect(result.error).toBeUndefined();
  });

  test('updateTemplate - should return error', async () => {
    axiosMock.onPut('/v1/template/real-id').reply(400, {
      statusCode: 400,
      technicalMessage: 'Bad request',
      details: {
        message: 'Contains invalid characters',
      },
    });

    const result = await client.updateTemplate(
      'real-id',
      {
        name: 'test',
        message: '<html></html>',
        templateType: 'NHS_APP',
      },
      testToken,
      1
    );

    expect(result.error).toEqual({
      errorMeta: {
        code: 400,
        description: 'Bad request',
        details: {
          message: 'Contains invalid characters',
        },
      },
    });

    expect(result.data).toBeUndefined();

    expect(axiosMock.history.put.length).toBe(1);
  });

  test('updateTemplate - should return template', async () => {
    const data = {
      id: 'id',
      name: 'name',
      message: 'message',
      templateStatus: 'SUBMITTED',
      templateType: 'NHS_APP',
    };

    axiosMock.onPut('/v1/template/real-id').reply(200, {
      statusCode: 200,
      data,
    });

    const result = await client.updateTemplate(
      'real-id',
      {
        name: 'name',
        message: 'message',
        templateType: 'NHS_APP',
      },
      testToken,
      1
    );

    expect(result.data).toEqual(data);

    expect(result.error).toBeUndefined();

    const headers = axiosMock.history.at(0)?.headers;

    expect(headers ? headers['X-Lock-Number'] : null).toEqual('1');
  });

  test('patchTemplate - should return error', async () => {
    axiosMock.onPatch('/v1/template/real-id').reply(400, {
      statusCode: 400,
      technicalMessage: 'Bad request',
      details: {
        message: 'Invalid patch data',
      },
    });

    const result = await client.patchTemplate(
      'real-id',
      {
        name: 'Updated Name',
      },
      testToken,
      5
    );

    expect(result.error).toEqual({
      errorMeta: {
        code: 400,
        description: 'Bad request',
        details: {
          message: 'Invalid patch data',
        },
      },
    });

    expect(result.data).toBeUndefined();

    expect(axiosMock.history.patch.length).toBe(1);
  });

  test('patchTemplate - should return template', async () => {
    const data = {
      id: 'real-id',
      name: 'Updated Template Name',
      templateType: 'LETTER',
      templateStatus: 'NOT_YET_SUBMITTED',
      letterType: 'x1',
      language: 'en',
      letterVersion: 'AUTHORING',
      lockNumber: 6,
    };

    axiosMock.onPatch('/v1/template/real-id').reply(200, {
      statusCode: 200,
      data,
    });

    const result = await client.patchTemplate(
      'real-id',
      {
        name: 'Updated Template Name',
      },
      testToken,
      5
    );

    expect(result.data).toEqual(data);

    expect(result.error).toBeUndefined();

    const headers = axiosMock.history.at(0)?.headers;

    expect(headers ? headers['X-Lock-Number'] : null).toEqual('5');
  });

  test('getTemplate - should return error', async () => {
    axiosMock.onGet('/v1/template/real-id').reply(404, {
      statusCode: 404,
      technicalMessage: 'Not found',
      details: {
        message: 'Template not found',
      },
    });

    const result = await client.getTemplate('real-id', testToken);

    expect(result.error).toEqual({
      errorMeta: {
        code: 404,
        description: 'Not found',
        details: {
          message: 'Template not found',
        },
      },
    });

    expect(result.data).toBeUndefined();

    expect(axiosMock.history.get.length).toBe(1);
  });

  test('getTemplate - should return template', async () => {
    const data = {
      id: 'id',
      name: 'name',
      message: 'message',
      templateStatus: 'SUBMITTED',
      templateType: 'NHS_APP',
    };

    axiosMock.onGet('/v1/template/real-id').reply(200, {
      statusCode: 200,
      data,
    });

    const result = await client.getTemplate('real-id', testToken);

    expect(result.data).toEqual(data);

    expect(result.error).toBeUndefined();
  });

  test('listTemplates - should return error', async () => {
    axiosMock.onGet('/v1/templates').reply(500, {
      statusCode: 500,
      technicalMessage: 'Internal server error',
    });

    const result = await client.listTemplates(testToken);

    expect(result.error).toEqual({
      errorMeta: {
        code: 500,
        description: 'Internal server error',
      },
    });

    expect(result.data).toBeUndefined();

    expect(axiosMock.history.get.length).toBe(4);
  });

  test('listTemplates - should return templates', async () => {
    const data = {
      id: 'id',
      name: 'name',
      message: 'message',
      templateStatus: 'SUBMITTED',
      templateType: 'NHS_APP',
    };

    axiosMock.onGet('/v1/templates').reply(200, {
      statusCode: 200,
      data: [data],
    });

    const result = await client.listTemplates(testToken);

    expect(result.data).toEqual([data]);

    expect(result.error).toBeUndefined();
  });

  describe('submitTemplate', () => {
    test('should return error', async () => {
      axiosMock.onPatch('/v1/template/real-id/submit').reply(400, {
        statusCode: 400,
        technicalMessage: 'Bad request',
        details: {
          message: 'Contains invalid characters',
        },
      });

      const result = await client.submitTemplate('real-id', testToken, 2);

      expect(result.error).toEqual({
        errorMeta: {
          code: 400,
          description: 'Bad request',
          details: {
            message: 'Contains invalid characters',
          },
        },
      });

      expect(result.data).toBeUndefined();

      expect(axiosMock.history.patch.length).toBe(1);

      const headers = axiosMock.history.at(0)?.headers;

      expect(headers ? headers['X-Lock-Number'] : null).toEqual('2');
    });

    test('should return template', async () => {
      const data = {
        id: 'real-id',
        name: 'name',
        message: 'message',
        templateStatus: 'SUBMITTED',
        templateType: 'NHS_APP',
      };

      axiosMock.onPatch('/v1/template/real-id/submit').reply(200, {
        statusCode: 200,
        data,
      });

      const result = await client.submitTemplate('real-id', testToken, 2);

      expect(result.data).toEqual(data);

      expect(result.error).toBeUndefined();
    });
  });

  describe('deleteTemplate', () => {
    test('should return error', async () => {
      axiosMock.onDelete('/v1/template/real-id').reply(400, {
        statusCode: 400,
        technicalMessage: 'Bad request',
        details: {
          message: 'Cannot delete a submitted template',
        },
      });

      const result = await client.deleteTemplate('real-id', testToken, 3);

      expect(result.error).toEqual({
        errorMeta: {
          code: 400,
          description: 'Bad request',
          details: {
            message: 'Cannot delete a submitted template',
          },
        },
      });

      expect(result.data).toBeUndefined();

      expect(axiosMock.history.delete.length).toBe(1);

      const headers = axiosMock.history.at(0)?.headers;

      expect(headers ? headers['X-Lock-Number'] : null).toEqual('3');
    });

    test('should return no content', async () => {
      axiosMock.onDelete('/v1/template/real-id').reply(204);

      const result = await client.deleteTemplate('real-id', testToken, 3);

      expect(result.data).toBeUndefined();

      expect(result.error).toBeUndefined();
    });
  });

  describe('requestProof', () => {
    test('should return error', async () => {
      axiosMock.onPost('/v1/template/real-id/proof').reply(400, {
        statusCode: 400,
        technicalMessage: 'Bad request',
        details: {
          message: 'Template cannot be proofed',
        },
      });

      const result = await client.requestProof('real-id', testToken, 4);

      expect(result.error).toEqual({
        errorMeta: {
          code: 400,
          description: 'Bad request',
          details: {
            message: 'Template cannot be proofed',
          },
        },
      });

      expect(result.data).toBeUndefined();

      expect(axiosMock.history.post.length).toBe(1);

      const headers = axiosMock.history.at(0)?.headers;

      expect(headers ? headers['X-Lock-Number'] : null).toEqual('4');
    });

    test('should return content', async () => {
      const data = {
        id: 'id',
        name: 'name',
        message: 'message',
        templateStatus: 'NOT_YET_SUBMITTED',
        templateType: 'LETTER',
      };

      axiosMock.onPost('/v1/template/real-id/proof').reply(204, { data });

      const result = await client.requestProof('real-id', testToken, 4);

      expect(result.data).toEqual(data);

      expect(result.error).toBeUndefined();
    });
  });

  describe('getTemplateLetterVariants', () => {
    test('should return error', async () => {
      axiosMock.onGet('/v1/template/template-123/letter-variants').reply(500, {
        statusCode: 500,
        technicalMessage: 'Internal server error',
        details: {
          message: 'Failed to fetch letter variants',
        },
      });

      const result = await client.getTemplateLetterVariants(
        'template-123',
        testToken
      );

      expect(result.error).toEqual({
        errorMeta: {
          code: 500,
          description: 'Internal server error',
          details: {
            message: 'Failed to fetch letter variants',
          },
        },
      });

      expect(result.data).toBeUndefined();
    });

    test('should return letter variants', async () => {
      const letterVariants: LetterVariant[] = [
        {
          id: 'variant-1',
          name: 'First Class',
          bothSides: true,
          dispatchTime: 'standard',
          envelopeSize: 'C4',
          maxSheets: 4,
          postage: 'first class',
          printColour: 'black',
          sheetSize: 'A4',
          status: 'PROD',
          type: 'STANDARD',
        },
        {
          id: 'variant-2',
          name: 'Economy',
          bothSides: true,
          dispatchTime: 'standard',
          envelopeSize: 'C4',
          maxSheets: 4,
          postage: 'economy',
          printColour: 'black',
          sheetSize: 'A4',
          status: 'PROD',
          type: 'STANDARD',
        },
      ];

      axiosMock.onGet('/v1/template/template-123/letter-variants').reply(200, {
        statusCode: 200,
        data: letterVariants,
      });

      const result = await client.getTemplateLetterVariants(
        'template-123',
        testToken
      );

      expect(result.data).toEqual(letterVariants);

      expect(result.error).toBeUndefined();
    });
  });
});

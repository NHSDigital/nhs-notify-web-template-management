import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { TemplateApiClient, TemplateClient } from '../template-api-client';
import { TemplateStatus, TemplateType } from '../types/generated';

const axiosMock = new MockAdapter(axios);

const testToken = 'abc';

describe('TemplateAPIClient', () => {
  beforeEach(() => {
    axiosMock.reset();
  });

  test('TemplateClient should construct TemplateApiClient', () => {
    const result = TemplateClient(testToken);

    expect(result).toBeTruthy();
  });

  test('createTemplate - should return error', async () => {
    axiosMock.onPost('/v1/template').reply(400, {
      statusCode: 400,
      technicalMessage: 'Bad request',
      details: {
        message: 'Contains invalid characters',
      },
    });

    const client = new TemplateApiClient(testToken);

    const result = await client.createTemplate({
      name: 'test',
      message: '<html></html>',
      templateType: TemplateType.NHS_APP,
    });

    expect(result.error).toEqual({
      code: 400,
      message: 'Bad request',
      details: {
        message: 'Contains invalid characters',
      },
    });

    expect(result.data).toBeUndefined();

    expect(axiosMock.history.post.length).toBe(1);
  });

  test('createTemplate - should return template', async () => {
    axiosMock.onPost('/v1/template').reply(201, {
      statusCode: 201,
      template: {
        id: 'id',
        name: 'name',
        message: 'message',
        templateType: TemplateType.NHS_APP,
      },
    });

    const client = new TemplateApiClient(testToken);

    const result = await client.createTemplate({
      name: 'name',
      message: 'message',
      templateType: TemplateType.NHS_APP,
    });

    expect(result.data).toEqual({
      id: 'id',
      name: 'name',
      message: 'message',
      templateType: TemplateType.NHS_APP,
    });

    expect(result.error).toBeUndefined();
  });

  test('updateTemplate - should return error', async () => {
    axiosMock.onPost('/v1/template/real-id').reply(400, {
      statusCode: 400,
      technicalMessage: 'Bad request',
      details: {
        message: 'Contains invalid characters',
      },
    });

    const client = new TemplateApiClient(testToken);

    const result = await client.updateTemplate('real-id', {
      name: 'test',
      message: '<html></html>',
      templateStatus: TemplateStatus.SUBMITTED,
      templateType: TemplateType.NHS_APP,
    });

    expect(result.error).toEqual({
      code: 400,
      message: 'Bad request',
      details: {
        message: 'Contains invalid characters',
      },
    });

    expect(result.data).toBeUndefined();

    expect(axiosMock.history.post.length).toBe(1);
  });

  test('updateTemplate - should return template', async () => {
    const data = {
      id: 'id',
      name: 'name',
      message: 'message',
      templateStatus: TemplateStatus.SUBMITTED,
      templateType: TemplateType.NHS_APP,
    };

    axiosMock.onPost('/v1/template/real-id').reply(200, {
      statusCode: 200,
      template: data,
    });

    const client = new TemplateApiClient(testToken);

    const result = await client.updateTemplate('real-id', {
      name: 'name',
      message: 'message',
      templateStatus: TemplateStatus.SUBMITTED,
      templateType: TemplateType.NHS_APP,
    });

    expect(result.data).toEqual(data);

    expect(result.error).toBeUndefined();
  });

  test('getTemplate - should return error', async () => {
    axiosMock.onGet('/v1/template/real-id').reply(404, {
      statusCode: 404,
      technicalMessage: 'Not found',
      details: {
        message: 'Template not found',
      },
    });

    const client = new TemplateApiClient(testToken);

    const result = await client.getTemplate('real-id');

    expect(result.error).toEqual({
      code: 404,
      message: 'Not found',
      details: {
        message: 'Template not found',
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
      templateStatus: TemplateStatus.SUBMITTED,
      templateType: TemplateType.NHS_APP,
    };

    axiosMock.onGet('/v1/template/real-id').reply(200, {
      statusCode: 200,
      template: data,
    });

    const client = new TemplateApiClient(testToken);

    const result = await client.getTemplate('real-id');

    expect(result.data).toEqual(data);

    expect(result.error).toBeUndefined();
  });

  test('listTemplates - should return error', async () => {
    axiosMock.onGet('/v1/templates').reply(500, {
      statusCode: 500,
      technicalMessage: 'Internal server error',
    });

    const client = new TemplateApiClient(testToken);

    const result = await client.listTemplates();

    expect(result.error).toEqual({
      code: 500,
      message: 'Internal server error',
    });

    expect(result.data).toBeUndefined();

    expect(axiosMock.history.get.length).toBe(4);
  });

  test('listTemplates - should return templates', async () => {
    const data = {
      id: 'id',
      name: 'name',
      message: 'message',
      templateStatus: TemplateStatus.SUBMITTED,
      templateType: TemplateType.NHS_APP,
    };

    axiosMock.onGet('/v1/templates').reply(200, {
      statusCode: 200,
      templates: [data],
    });

    const client = new TemplateApiClient(testToken);

    const result = await client.listTemplates();

    expect(result.data).toEqual([data]);

    expect(result.error).toBeUndefined();
  });
});

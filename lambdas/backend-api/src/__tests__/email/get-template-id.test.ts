import { mockDeep } from 'jest-mock-extended';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { getTemplateId } from '../../email/get-template-id';

test('missing event body', () => {
  expect(() =>
    getTemplateId(
      mockDeep<APIGatewayProxyEvent>({
        body: undefined,
      })
    )
  ).toThrow('Missing event body');
});

test('missing template id', () => {
  expect(() =>
    getTemplateId(
      mockDeep<APIGatewayProxyEvent>({
        body: JSON.stringify({}),
      })
    )
  ).toThrow('Missing template ID');
});

test('gets template id', () => {
  expect(
    getTemplateId(
      mockDeep<APIGatewayProxyEvent>({
        body: JSON.stringify({
          templateId: 'template-id',
        }),
      })
    )
  ).toEqual('template-id');
});

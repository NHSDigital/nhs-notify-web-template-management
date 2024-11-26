import { APIGatewayProxyEvent } from 'aws-lambda';
import { ErrorWithStatusCode } from '../error-with-status-code';

export const getTemplateId = (event: APIGatewayProxyEvent): string => {
  if (!event.body) {
    throw new ErrorWithStatusCode('Missing event body', 400);
  }

  const eventBodyJson = JSON.parse(event.body);

  if (!eventBodyJson.templateId) {
    throw new ErrorWithStatusCode('Missing template ID', 400);
  }

  return eventBodyJson.templateId;
};

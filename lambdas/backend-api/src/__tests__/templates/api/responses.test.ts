import { apiSuccess, apiFailure } from '@backend-api/templates/api/responses';
import { TemplateDto } from 'nhs-notify-backend-client';

describe('responses', () => {
  it('should return success response', () => {
    const dto: TemplateDto = {
      id: '1',
      name: 'name',
      message: 'message',
      subject: 'subject',
      templateStatus: 'SUBMITTED',
      templateType: 'EMAIL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lockNumber: 1,
    };
    expect(apiSuccess(200, dto)).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, data: dto }),
    });
  });

  it('should return failure response', () => {
    expect(apiFailure(400, 'error')).toEqual({
      statusCode: 400,
      body: JSON.stringify({ statusCode: 400, technicalMessage: 'error' }),
    });
  });
});

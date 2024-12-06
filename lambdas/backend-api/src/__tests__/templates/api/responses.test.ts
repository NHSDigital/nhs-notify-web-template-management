import { apiSuccess, apiFailure } from '@backend-api/templates/api/responses';
import {
  TemplateDTO,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';

describe('responses', () => {
  it('should return success response', () => {
    const dto: TemplateDTO = {
      id: '1',
      name: 'name',
      message: 'message',
      templateStatus: TemplateStatus.SUBMITTED,
      templateType: TemplateType.EMAIL,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    expect(apiSuccess(200, dto)).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, template: dto }),
    });
  });

  it('should return failure response', () => {
    expect(apiFailure(400, 'error')).toEqual({
      statusCode: 400,
      body: JSON.stringify({ statusCode: 400, technicalMessage: 'error' }),
    });
  });
});

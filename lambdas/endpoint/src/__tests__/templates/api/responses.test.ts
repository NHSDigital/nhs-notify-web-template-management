import {success, failure } from '@templates/api/responses';
import { TemplateDTO, TemplateStatus, TemplateType } from 'nhs-notify-templates-client';

describe('responses', () => {
  it('should return success response', () => {
    const dto: TemplateDTO = {
      id: '1',
      name: 'name',
      message: 'message',
      status: TemplateStatus.SUBMITTED,
      type: TemplateType.EMAIL,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    expect(success(200, dto)).toEqual({
      statusCode: 200,
      body: JSON.stringify({ statusCode: 200, template: dto }),
    });
  });

  it('should return failure response', () => {
    expect(failure(400, 'error')).toEqual({
      statusCode: 400,
      body: JSON.stringify({ statusCode: 400, technicalMessage: 'error' }),
    });
  });
});

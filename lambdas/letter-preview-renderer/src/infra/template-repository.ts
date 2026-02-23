import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { TemplateUpdateBuilder } from 'nhs-notify-entity-update-command-builder';
import type { ValidationErrorDetail } from 'nhs-notify-backend-client/src/types/generated/types.gen';
import type { Personalisation } from '../types/types';
import type { RenderRequest } from 'nhs-notify-backend-client/src/types/render-request';

export class TemplateRepository {
  constructor(
    private readonly ddb: DynamoDBDocumentClient,
    private readonly templatesTableName: string
  ) {}

  async updateRendered(
    request: RenderRequest,
    personalisation: Personalisation,
    currentVersion: string,
    fileName: string,
    pageCount: number,
    validationErrors?: ValidationErrorDetail[]
  ) {
    if (request.requestType !== 'initial') return;

    const hasValidationErrors = validationErrors && validationErrors.length > 0;

    const builder = new TemplateUpdateBuilder(
      this.templatesTableName,
      request.clientId,
      request.templateId
    )
      .incrementLockNumber()
      .expectTemplateExists()
      .expectStatus('PENDING_VALIDATION')
      .setStatus(
        hasValidationErrors ? 'VALIDATION_FAILED' : 'NOT_YET_SUBMITTED'
      )
      .setPersonalisation(personalisation.system, personalisation.custom)
      .setInitialRender({
        status: 'RENDERED',
        currentVersion,
        fileName,
        pageCount,
      });

    if (hasValidationErrors) {
      builder.appendValidationErrors(validationErrors);
    }

    return await this.ddb.send(new UpdateCommand(builder.build()));
  }

  async updateFailure(
    request: RenderRequest,
    personalisation?: Personalisation,
    validationErrors?: ValidationErrorDetail[]
  ) {
    if (request.requestType !== 'initial') return;

    const builder = new TemplateUpdateBuilder(
      this.templatesTableName,
      request.clientId,
      request.templateId
    )
      .incrementLockNumber()
      .expectTemplateExists()
      .expectStatus('PENDING_VALIDATION')
      .setStatus('VALIDATION_FAILED')
      .setInitialRender({
        status: 'FAILED',
      });

    if (personalisation) {
      builder.setPersonalisation(
        personalisation.system,
        personalisation.custom
      );
    }

    if (validationErrors && validationErrors.length > 0) {
      builder.appendValidationErrors(validationErrors);
    }

    return await this.ddb.send(new UpdateCommand(builder.build()));
  }
}

import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { TemplateUpdateBuilder } from 'nhs-notify-entity-update-command-builder';
import type { ValidationErrorDetail } from 'nhs-notify-web-template-management-types';
import type { Personalisation } from '../types/types';
import type {
  InitialRenderRequest,
  PersonalisedRenderRequest,
} from 'nhs-notify-backend-client/src/types/render-request';

export class TemplateRepository {
  constructor(
    private readonly ddb: DynamoDBDocumentClient,
    private readonly templatesTableName: string
  ) {}

  async updateRenderedInitial(
    request: InitialRenderRequest,
    personalisation: Personalisation,
    currentVersion: string,
    fileName: string,
    pageCount: number,
    validationErrors?: ValidationErrorDetail[]
  ) {
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

  async updateFailureInitial(
    request: InitialRenderRequest,
    personalisation?: Personalisation,
    validationErrors?: ValidationErrorDetail[]
  ) {
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

  async updateRenderedPersonalised(
    request: PersonalisedRenderRequest,
    currentVersion: string,
    fileName: string,
    pageCount: number
  ) {
    const builder = new TemplateUpdateBuilder(
      this.templatesTableName,
      request.clientId,
      request.templateId
    )
      .incrementLockNumber()
      .expectTemplateExists()
      .setPersonalisedRender(request.requestTypeVariant, {
        status: 'RENDERED',
        currentVersion,
        fileName,
        pageCount,
        personalisationParameters: request.personalisation,
      });

    return await this.ddb.send(new UpdateCommand(builder.build()));
  }

  async updateFailurePersonalised(request: PersonalisedRenderRequest) {
    const builder = new TemplateUpdateBuilder(
      this.templatesTableName,
      request.clientId,
      request.templateId
    )
      .incrementLockNumber()
      .expectTemplateExists()
      .setPersonalisedRender(request.requestTypeVariant, {
        status: 'FAILED',
      });

    return await this.ddb.send(new UpdateCommand(builder.build()));
  }
}

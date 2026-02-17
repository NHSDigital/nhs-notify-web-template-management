import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type {
  AuthoringRenderDetails,
  TemplateStatus,
} from 'nhs-notify-backend-client';
import type { TemplateRenderIds } from 'nhs-notify-backend-client/src/types/render-request';
import { TemplateUpdateBuilder } from 'nhs-notify-entity-update-command-builder';
import type { Personalisation, RenderVariant } from '../types/types';
import { RenderFailureError } from '../types/errors';

export type RenderDetails = {
  currentVersion: string;
  fileName: string;
  pageCount: number;
};

export class TemplateRepository {
  constructor(
    private readonly ddb: DynamoDBDocumentClient,
    private readonly templatesTableName: string
  ) {}

  async update(
    template: TemplateRenderIds,
    renderVariant: RenderVariant,
    personalisation: Personalisation,
    renderDetails: AuthoringRenderDetails
  ) {
    if (renderVariant !== 'initial') return;

    const templateStatus: TemplateStatus =
      renderDetails.status === 'RENDERED'
        ? 'NOT_YET_SUBMITTED'
        : 'VALIDATION_FAILED';

    const builder = new TemplateUpdateBuilder(
      this.templatesTableName,
      template.clientId,
      template.templateId
    )
      .incrementLockNumber()
      .expectTemplateExists()
      .expectNotFinalStatus()
      .setStatus(templateStatus)
      .setPersonalisation(personalisation.system, personalisation.custom);

    builder.setInitialRender(renderDetails);

    await this.ddb.send(new UpdateCommand(builder.build())).catch((error) => {
      throw new RenderFailureError('db-update', error);
    });
  }

  async updateFailed(
    template: TemplateRenderIds,
    renderVariant: RenderVariant,
    personalisation?: Personalisation
  ) {
    if (renderVariant !== 'initial') return;

    const builder = new TemplateUpdateBuilder(
      this.templatesTableName,
      template.clientId,
      template.templateId
    )
      .incrementLockNumber()
      .expectTemplateExists()
      .expectNotFinalStatus()
      .setStatus('VALIDATION_FAILED');

    if (personalisation) {
      builder.setPersonalisation(
        personalisation.system,
        personalisation.custom
      );
    }

    builder.setInitialRender({ status: 'FAILED' });

    await this.ddb.send(new UpdateCommand(builder.build())).catch((error) => {
      throw new RenderFailureError('db-update', error);
    });
  }
}

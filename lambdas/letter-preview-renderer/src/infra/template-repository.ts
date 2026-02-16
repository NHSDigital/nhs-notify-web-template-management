import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import type {
  AuthoringRenderDetails,
  RenderStatus,
  TemplateStatus,
} from 'nhs-notify-backend-client';
import type { TemplateRenderIds } from 'nhs-notify-backend-client/src/types/render-request';
import { TemplateUpdateBuilder } from 'nhs-notify-entity-update-command-builder';
import type { RenderVariant } from '../types/types';
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
    renderStatus: RenderStatus,
    templateStatus: Extract<
      TemplateStatus,
      'NOT_YET_SUBMITTED' | 'VALIDATION_FAILED'
    >,
    renderDetails: RenderDetails
  ): Promise<void> {
    const builder = new TemplateUpdateBuilder(
      this.templatesTableName,
      template.clientId,
      template.templateId
    )
      .incrementLockNumber()
      .expectTemplateExists()
      .expectNotFinalStatus()
      .setStatus(templateStatus);

    const authoringRenderDetails: AuthoringRenderDetails = {
      status: renderStatus,
      ...renderDetails,
    };

    builder.setInitialRender(authoringRenderDetails);

    try {
      await this.ddb.send(new UpdateCommand(builder.build()));
    } catch (error) {
      throw new RenderFailureError('db-update', error);
    }
  }

  async updateFailed(
    template: TemplateRenderIds,
    renderVariant: RenderVariant,
    templateStatus: Extract<TemplateStatus, 'VALIDATION_FAILED'>
  ): Promise<void> {
    const builder = new TemplateUpdateBuilder(
      this.templatesTableName,
      template.clientId,
      template.templateId
    )
      .incrementLockNumber()
      .expectTemplateExists()
      .expectNotFinalStatus()
      .setStatus(templateStatus);

    const failedRenderDetails: AuthoringRenderDetails = {
      status: 'FAILED',
      currentVersion: '',
      fileName: '',
      pageCount: 0,
    };

    builder.setInitialRender(failedRenderDetails);

    try {
      await this.ddb.send(new UpdateCommand(builder.build()));
    } catch (error) {
      throw new RenderFailureError('db-update', error);
    }
  }
}

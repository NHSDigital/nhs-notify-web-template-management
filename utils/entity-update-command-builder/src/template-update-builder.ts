import type {
  TemplateStatus,
  ValidatedTemplateDto,
} from 'nhs-notify-backend-client';
import { EntityUpdateBuilder } from './domain/entity-update-builder';
import { BuilderOptionalArgs } from './types/builders';

export class TemplateUpdateBuilder extends EntityUpdateBuilder<ValidatedTemplateDto> {
  constructor(
    tableName: string,
    owner: string,
    id: string,
    optionalArgs?: BuilderOptionalArgs
  ) {
    super(
      tableName,
      {
        owner,
        id,
      },
      optionalArgs
    );
  }

  setStatus(status: TemplateStatus) {
    this.updateBuilder.setValue('templateStatus', status);
    return this;
  }

  expectedStatus(expectedStatus: TemplateStatus | TemplateStatus[]) {
    if (Array.isArray(expectedStatus)) {
      this.updateBuilder.inCondition('templateStatus', expectedStatus);
      return this;
    }
    this.updateBuilder.andCondition('templateStatus', expectedStatus, '=');
    return this;
  }
}

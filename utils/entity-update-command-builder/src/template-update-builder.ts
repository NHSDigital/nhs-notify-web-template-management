import type { TemplateStatus } from 'nhs-notify-backend-client';
import { EntityUpdateBuilder } from './domain/entity-update-builder';
import { BuilderOptionalArgs } from './types/builders';
import { MergedTemplate } from './types/template';

export class TemplateUpdateBuilder extends EntityUpdateBuilder<MergedTemplate> {
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

  setLockTimeConditionally(
    lockField: 'sftpSendLockTime',
    timeMs: number,
    lockExpiryTimeMs?: number
  ) {
    this.updateBuilder
      .setValue(lockField, timeMs)
      .andCondition(lockField, 0, '<>');

    if (lockExpiryTimeMs) {
      this.updateBuilder.andCondition(lockField, lockExpiryTimeMs, '>');
    }

    this.updateBuilder.fnCondition(
      lockField,
      null,
      'attribute_not_exists',
      false,
      'OR'
    );

    return this;
  }

  setLockTimeUnconditionally(lockField: 'sftpSendLockTime', timeMs: number) {
    this.updateBuilder.setValue(lockField, timeMs);

    return this;
  }

  build() {
    return this.updateBuilder
      .setValue('updatedAt', new Date().toISOString())
      .build();
  }
}

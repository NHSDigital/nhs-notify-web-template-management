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

  setLockTime(
    lockField: 'sftpSendLockTime',
    timeMs: number,
    lockExpiryTimeMs?: number
  ) {
    this.updateBuilder
      .setValue(lockField, timeMs)
      .fnCondition(lockField, null, 'attribute_not_exists');

    if (lockExpiryTimeMs) {
      this.updateBuilder.orCondition(lockField, lockExpiryTimeMs, '>');
    }

    return this;
  }

  removeLockTime(lockField: 'sftpSendLockTime') {
    this.updateBuilder.removeAttribute(lockField);

    return this;
  }

  build() {
    return this.updateBuilder
      .setValue('updatedAt', new Date().toISOString())
      .build();
  }
}

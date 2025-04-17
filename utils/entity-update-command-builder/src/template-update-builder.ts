import type { TemplateStatus } from 'nhs-notify-backend-client';
import { BuilderOptionalArgs } from './types/builders';
import { DatabaseTemplate } from 'nhs-notify-web-template-management-utils';
import { UpdateCommandBuilder } from './common/update-command-builder';

export class TemplateUpdateBuilder extends UpdateCommandBuilder<DatabaseTemplate> {
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
    this.setValue('templateStatus', status);
    return this;
  }

  expectedStatus(expectedStatus: TemplateStatus | TemplateStatus[]) {
    if (Array.isArray(expectedStatus)) {
      this.inCondition('templateStatus', expectedStatus);
      return this;
    }
    this.andCondition('templateStatus', '=', expectedStatus);
    return this;
  }

  setLockTime(
    lockField: 'sftpSendLockTime',
    timeMs: number,
    lockExpiryTimeMs?: number
  ) {
    this.setValue(lockField, timeMs).fnCondition(
      'attribute_not_exists',
      lockField
    );

    if (lockExpiryTimeMs) {
      this.orCondition(lockField, '>', lockExpiryTimeMs);
    }
    return this;
  }

  setLockTimeUnconditional(lockField: 'sftpSendLockTime', timeMs: number) {
    this.setValue(lockField, timeMs);
    return this;
  }

  build() {
    return this.setValue('updatedAt', new Date().toISOString()).finalise();
  }
}

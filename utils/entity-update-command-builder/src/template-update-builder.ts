import type { TemplateStatus, TemplateType } from 'nhs-notify-backend-client';
import { BuilderOptionalArgs } from './types/builders';
import { DatabaseTemplate } from 'nhs-notify-web-template-management-utils';
import { EntityUpdateBuilder } from './common/entity-update-builder';

export class TemplateUpdateBuilder extends EntityUpdateBuilder<DatabaseTemplate> {
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
    this.updateBuilder.andCondition('templateStatus', '=', expectedStatus);
    return this;
  }

  setLockTime(
    lockField: 'sftpSendLockTime',
    timeMs: number,
    lockExpiryTimeMs?: number
  ) {
    this.updateBuilder
      .setValue(lockField, timeMs)
      .fnCondition('attribute_not_exists', lockField);

    if (lockExpiryTimeMs) {
      this.updateBuilder.orCondition(lockField, '>', lockExpiryTimeMs);
    }
    return this;
  }

  initialiseSupplierReferences() {
    this.updateBuilder.setValueIfNotExists('supplierReferences', {});
    return this;
  }

  setSupplierReference(supplier: string, supplierReference: string) {
    this.updateBuilder.setValueInMap(
      'supplierReferences',
      supplier,
      supplierReference
    );
    return this;
  }

  setLockTimeUnconditional(lockField: 'sftpSendLockTime', timeMs: number) {
    this.updateBuilder.setValue(lockField, timeMs);
    return this;
  }

  expectedTemplateType(type: TemplateType) {
    this.updateBuilder.andCondition('templateType', '=', type);
    return this;
  }

  expectedClientId(id: string) {
    this.updateBuilder.andCondition('clientId', '=', id);
    return this;
  }

  expectTemplateExists() {
    this.updateBuilder.fnCondition('attribute_exists', 'id');
    return this;
  }

  expectProofingEnabled() {
    this.updateBuilder.andCondition('proofingEnabled', '=', true);
    return this;
  }

  build() {
    return this.updateBuilder
      .setValue('updatedAt', new Date().toISOString())
      .finalise();
  }
}

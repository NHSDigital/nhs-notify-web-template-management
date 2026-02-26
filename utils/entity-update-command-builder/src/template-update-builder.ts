import type {
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-web-template-management-types';
import { BuilderOptionalArgs } from './types/builders';
import { DatabaseTemplate } from 'nhs-notify-web-template-management-utils';
import { EntityUpdateBuilder } from './common/entity-update-builder';

export class TemplateUpdateBuilder extends EntityUpdateBuilder<DatabaseTemplate> {
  constructor(
    tableName: string,
    clientId: string,
    id: string,
    optionalArgs?: BuilderOptionalArgs
  ) {
    super(
      tableName,
      {
        owner: `CLIENT#${clientId}`,
        id,
      },
      optionalArgs
    );
  }

  setName(name: string) {
    this.updateBuilder.setValue('name', name);
    return this;
  }

  setCampaignId(campaignId: string) {
    this.updateBuilder.setValue('campaignId', campaignId);
    return this;
  }

  setSubject(subject: string) {
    this.updateBuilder.setValue('subject', subject);
    return this;
  }

  setMessage(message: string) {
    this.updateBuilder.setValue('message', message);
    return this;
  }

  setStatus(status: TemplateStatus) {
    this.updateBuilder.setValue('templateStatus', status);
    return this;
  }

  setTTL(ttl: number) {
    this.updateBuilder.setValue('ttl', ttl);
    return this;
  }

  expectStatus(expectedStatus: TemplateStatus | TemplateStatus[]) {
    if (Array.isArray(expectedStatus)) {
      this.updateBuilder.conditions.andIn('templateStatus', expectedStatus);
      return this;
    }
    this.updateBuilder.conditions.and('templateStatus', '=', expectedStatus);
    return this;
  }

  setLockTime(
    lockField: 'sftpSendLockTime',
    timeMs: number,
    lockExpiryTimeMs?: number
  ) {
    this.updateBuilder
      .setValue(lockField, timeMs)
      .conditions.andFn('attribute_not_exists', lockField);

    if (lockExpiryTimeMs) {
      this.updateBuilder.conditions.or(lockField, '>', lockExpiryTimeMs);
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

  setUpdatedByUserAt(userRef: string) {
    this.updateBuilder
      .setValue('updatedAt', new Date().toISOString())
      .setValue('updatedBy', userRef);
    return this;
  }

  incrementLockNumber() {
    this.updateBuilder.addToValue('lockNumber', 1);
    return this;
  }

  expectTemplateType(type: TemplateType) {
    this.updateBuilder.conditions.and('templateType', '=', type);
    return this;
  }

  expectClientId(id: string) {
    this.updateBuilder.conditions.and('clientId', '=', id);
    return this;
  }

  expectTemplateExists() {
    this.updateBuilder.conditions.andFn('attribute_exists', 'id');
    return this;
  }

  expectProofingEnabled() {
    this.updateBuilder.conditions.and('proofingEnabled', '=', true);
    return this;
  }

  expectLockNumber(lockNumber: number) {
    this.updateBuilder.conditions.andGroup((group) => {
      group
        .and('lockNumber', '=', lockNumber)
        .orFn('attribute_not_exists', 'lockNumber');
    });

    return this;
  }

  expectNotStatus(expectedStatus: TemplateStatus | TemplateStatus[]) {
    if (Array.isArray(expectedStatus)) {
      this.updateBuilder.conditions.andIn(
        'templateStatus',
        expectedStatus,
        true
      );
      return this;
    }
    this.updateBuilder.conditions.and(
      'templateStatus',
      '=',
      expectedStatus,
      true
    );
    return this;
  }

  expectNotFinalStatus() {
    this.expectNotStatus(['DELETED', 'SUBMITTED']);
    return this;
  }

  build() {
    return this.updateBuilder.finalise();
  }
}

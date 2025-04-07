import { EntityUpdateBuilder } from './domain/entity-update-builder';
import { BuilderOptionalArgs } from './types/builders';

export class TemplateBuilder extends EntityUpdateBuilder<RequestItemPlan> {
  constructor(
    tableName: string,
    requestItemId: string,
    requestItemPlanId: string,
    optionalArgs?: BuilderOptionalArgs
  ) {
    super(
      tableName,
      {
        PK: `REQUEST_ITEM#${requestItemId}`,
        SK: `REQUEST_ITEM_PLAN#${requestItemPlanId}`,
      },
      optionalArgs
    );
  }

  private formatRouterGroup(
    queueName: string,
    shard: number,
    status: RouterGroupStatus
  ): string {
    return `${queueName}#${shard}#${status}`;
  }

  setDateSent(date: Date = new Date()) {
    this.updateBuilder.setValue('dateSent', date.toISOString());
    return this;
  }

  setCompletedDate(date: Date = new Date()) {
    const currentDateTime = date.toISOString();
    this.updateBuilder.setValue('completedDate', currentDateTime);
    return this;
  }

  setStatus(value: RequestItemPlanStatus) {
    this.updateBuilder.setValue('status', value);
    return this;
  }

  expectedStatus(
    expectedStatus: RequestItemPlanStatus | RequestItemPlanStatus[]
  ) {
    if (Array.isArray(expectedStatus)) {
      this.updateBuilder.inCondition('status', expectedStatus);
      return this;
    }
    this.updateBuilder.andCondition('status', expectedStatus, '=');
    return this;
  }

  expectStatusIsNot(
    unexpectedStatus: RequestItemPlanStatus | RequestItemPlanStatus[]
  ) {
    if (Array.isArray(unexpectedStatus)) {
      this.updateBuilder.inCondition('status', unexpectedStatus, true);
      return this;
    }
    this.updateBuilder.andCondition('status', unexpectedStatus, '<>');
    return this;
  }

  expectedRouterGroup(
    queueName: string,
    shard: number,
    status: RouterGroupStatus
  ) {
    this.updateBuilder.andCondition(
      'routerGroup',
      this.formatRouterGroup(queueName, shard, status),
      '='
    );
    return this;
  }

  setFailedReason(value: string) {
    this.updateBuilder.setValue('failedReason', value);
    return this;
  }

  setPdsMetadata(value: PDSMetadata) {
    this.updateBuilder.setValue('pdsMetadata', value);
    return this;
  }

  removeFailedReason() {
    this.updateBuilder.removeAttribute('failedReason');
    return this;
  }

  removeRouterGroup(options?: { removeOrder?: boolean }) {
    this.updateBuilder.removeAttribute('routerGroup');

    if (options?.removeOrder) {
      this.updateBuilder.removeAttribute('routerGroupOrder');
    }

    return this;
  }

  setRouterGroup(
    queueName: string,
    shard: number,
    status: RouterGroupStatus,
    order?: string
  ) {
    this.updateBuilder.setValue(
      'routerGroup',
      this.formatRouterGroup(queueName, shard, status)
    );
    if (order) {
      this.updateBuilder.setValue('routerGroupOrder', order);
    }
    return this;
  }

  setSupplierReferenceId(supplierReferenceId: string) {
    this.updateBuilder.setValue('supplierReferenceId', supplierReferenceId);
    return this;
  }

  expectSupplierReferenceIdNotSet() {
    this.updateBuilder.fnCondition(
      'supplierReferenceId',
      null,
      'attribute_not_exists'
    );
    return this;
  }

  setSupplierTemplateId(supplierTemplateId: string) {
    this.updateBuilder.setValue('supplierTemplateId', supplierTemplateId);
    return this;
  }

  setSupplierStatus(value: SupplierStatus) {
    this.updateBuilder.setValue('supplierStatus', value);
    return this;
  }

  setSupplier(supplier: RequestItemPlanSupplier) {
    this.updateBuilder.setValue('supplier', supplier);
    return this;
  }

  setBatchId(batchId: string) {
    this.updateBuilder.setValue('batchId', batchId);
    return this;
  }

  incrementAttemptNumber() {
    this.updateBuilder.addToValue('attemptNumber', 1);
    return this;
  }

  removeSupplier() {
    this.updateBuilder.removeAttribute('supplier');
    return this;
  }
}

import type {
  CascadeGroup,
  CascadeItem,
  RoutingConfig,
  RoutingConfigStatus,
} from 'nhs-notify-backend-client';
import { BuilderOptionalArgs } from './types/builders';
import { EntityUpdateBuilder } from './common/entity-update-builder';

type DbOnlyFields = {
  updatedBy: string;
  createdBy: string;
  ttl?: number;
};

export class RoutingConfigUpdateBuilder extends EntityUpdateBuilder<
  RoutingConfig & DbOnlyFields
> {
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

  setStatus(status: RoutingConfigStatus) {
    this.updateBuilder.setValue('status', status);
    return this;
  }

  setCampaignId(campaignId: string) {
    this.updateBuilder.setValue('campaignId', campaignId);
    return this;
  }

  setCascade(cascade: CascadeItem[]) {
    this.updateBuilder.setValue('cascade', cascade);
    return this;
  }

  setCascadeGroupOverrides(cascadeGroupOverrides: CascadeGroup[]) {
    this.updateBuilder.setValue('cascadeGroupOverrides', cascadeGroupOverrides);
    return this;
  }

  setName(name: string) {
    this.updateBuilder.setValue('name', name);
    return this;
  }

  setUpdatedByUserAt(userRef: string) {
    this.updateBuilder
      .setValue('updatedAt', new Date().toISOString())
      .setValue('updatedBy', userRef);
    return this;
  }

  setTtl(ttl: number) {
    this.updateBuilder.setValue('ttl', ttl);
    return this;
  }

  expectStatus(expectedStatus: RoutingConfigStatus) {
    this.updateBuilder.conditions.and('status', '=', expectedStatus);
    return this;
  }

  expectRoutingConfigExists() {
    this.updateBuilder.conditions.andFn('attribute_exists', 'id');
    return this;
  }

  expectLockNumber(lockNumber: number) {
    this.updateBuilder.conditions.and('lockNumber', '=', lockNumber);

    return this;
  }

  incrementLockNumber() {
    this.updateBuilder.addToValue('lockNumber', 1);
    return this;
  }

  build() {
    return this.updateBuilder.finalise();
  }
}

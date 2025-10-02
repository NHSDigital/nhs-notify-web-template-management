import type {
  RoutingConfig,
  RoutingConfigStatus,
} from 'nhs-notify-backend-client';
import { BuilderOptionalArgs } from './types/builders';
import { EntityUpdateBuilder } from './common/entity-update-builder';

type DbOnlyFields = {
  updatedBy: string;
  createdBy: string;
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

  setUpdatedByUserAt(userId: string) {
    this.updateBuilder
      .setValue('updatedAt', new Date().toISOString())
      .setValue('updatedBy', userId);
    return this;
  }

  expectedStatus(expectedStatus: RoutingConfigStatus) {
    this.updateBuilder.andCondition('status', '=', expectedStatus);
    return this;
  }

  build() {
    return this.updateBuilder.finalise();
  }
}

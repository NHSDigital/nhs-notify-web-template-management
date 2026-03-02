import { type DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { $RoutingConfig } from 'nhs-notify-backend-client';
import type {
  RoutingConfig,
  RoutingConfigStatus,
} from 'nhs-notify-web-template-management-types';
import { AbstractQuery } from '../abstract-query';

export class RoutingConfigQuery extends AbstractQuery<RoutingConfig> {
  private includeStatuses: RoutingConfigStatus[] = [];
  private excludeStatuses: RoutingConfigStatus[] = [];

  constructor(
    docClient: DynamoDBDocumentClient,
    tableName: string,
    owner: string
  ) {
    super(docClient, 'Routing Config', $RoutingConfig, tableName, owner);
  }

  /** Include items with any of the given statuses. */
  status(...statuses: RoutingConfigStatus[]) {
    this.includeStatuses.push(...statuses);
    return this;
  }

  /** Exclude items with any of the given statuses. */
  excludeStatus(...statuses: RoutingConfigStatus[]) {
    this.excludeStatuses.push(...statuses);
    return this;
  }

  protected addFilters(): void {
    this.addFilterToQuery('status', 'INCLUDE', this.includeStatuses);
    this.addFilterToQuery('status', 'EXCLUDE', this.excludeStatuses);
  }
}

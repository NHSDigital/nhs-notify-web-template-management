import { type DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import {
  $TemplateDto,
  Language,
  LetterType,
  TemplateDto,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-backend-client';
import { AbstractQuery } from '../abstract-query';

export class TemplateQuery extends AbstractQuery<TemplateDto> {
  private includeStatuses: TemplateStatus[] = [];
  private excludeStatuses: TemplateStatus[] = [];
  private includeTemplateTypes: TemplateType[] = [];
  private includeLanguages: Language[] = [];
  private includeLetterTypes: LetterType[] = [];

  constructor(
    docClient: DynamoDBDocumentClient,
    tableName: string,
    owner: string
  ) {
    super(docClient, 'Template', $TemplateDto, tableName, owner);
  }

  /** Include items with any of the given template statuses. */
  templateStatus(statuses: TemplateStatus[]) {
    this.includeStatuses.push(...statuses);
    return this;
  }

  /** Exclude items with any of the given template statuses. */
  excludeTemplateStatus(statuses: TemplateStatus[]) {
    this.excludeStatuses.push(...statuses);
    return this;
  }

  /** Include items with any of the given template types. */
  templateType(templateTypes: TemplateType[]) {
    this.includeTemplateTypes.push(...templateTypes);
    return this;
  }

  /** Include items with any of the given languages. */
  language(languages: Language[]) {
    this.includeLanguages.push(...languages);
    return this;
  }

  letterType(letterTypes: LetterType[]) {
    this.includeLetterTypes.push(...letterTypes);
    return this;
  }

  protected addFilters(): void {
    this.addFilterToQuery('templateStatus', 'INCLUDE', this.includeStatuses);
    this.addFilterToQuery('templateStatus', 'EXCLUDE', this.excludeStatuses);
    this.addFilterToQuery('templateType', 'INCLUDE', this.includeTemplateTypes);
    this.addFilterToQuery('language', 'INCLUDE', this.includeLanguages);
    this.addFilterToQuery('letterType', 'INCLUDE', this.includeLetterTypes);
  }
}

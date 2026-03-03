import { type DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { $TemplateDto } from 'nhs-notify-backend-client';
import type {
  Language,
  LetterType,
  LetterVersion,
  TemplateDto,
  TemplateStatus,
  TemplateType,
} from 'nhs-notify-web-template-management-types';
import { AbstractQuery } from '../abstract-query';

export class TemplateQuery extends AbstractQuery<TemplateDto> {
  private includeStatuses: TemplateStatus[] = [];
  private excludeStatuses: TemplateStatus[] = [];
  private includeTemplateTypes: TemplateType[] = [];
  private includeLanguages: Language[] = [];
  private excludeLanguages: Language[] = [];
  private includeLetterTypes: LetterType[] = [];
  private includeLetterVersions: LetterVersion[] = [];

  constructor(
    docClient: DynamoDBDocumentClient,
    tableName: string,
    owner: string
  ) {
    super(docClient, 'Template', $TemplateDto, tableName, owner);
  }

  /** Include items with any of the given template statuses. */
  templateStatus(...statuses: TemplateStatus[]) {
    this.includeStatuses.push(...statuses);
    return this;
  }

  /** Exclude items with any of the given template statuses. */
  excludeTemplateStatus(...statuses: TemplateStatus[]) {
    this.excludeStatuses.push(...statuses);
    return this;
  }

  /** Include items with any of the given template types. */
  templateType(...templateTypes: TemplateType[]) {
    this.includeTemplateTypes.push(...templateTypes);
    return this;
  }

  /** Include items with any of the given languages. */
  language(...languages: Language[]) {
    this.includeLanguages.push(...languages);
    return this;
  }

  /** Exclude items with any of the given languages. */
  excludeLanguage(...languages: Language[]) {
    this.excludeLanguages.push(...languages);
    return this;
  }

  letterType(...letterTypes: LetterType[]) {
    this.includeLetterTypes.push(...letterTypes);
    return this;
  }

  letterVersion(...letterVersions: LetterVersion[]) {
    this.includeLetterVersions.push(...letterVersions);
    return this;
  }

  protected addFilters(): void {
    this.addFilterToQuery('templateStatus', 'INCLUDE', this.includeStatuses);
    this.addFilterToQuery('templateStatus', 'EXCLUDE', this.excludeStatuses);
    this.addFilterToQuery('templateType', 'INCLUDE', this.includeTemplateTypes);
    this.addFilterToQuery('language', 'INCLUDE', this.includeLanguages);
    this.addFilterToQuery('language', 'EXCLUDE', this.excludeLanguages);
    this.addFilterToQuery('letterType', 'INCLUDE', this.includeLetterTypes);
    this.addFilterToQuery(
      'letterVersion',
      'INCLUDE',
      this.includeLetterVersions
    );
  }
}

import { Template } from 'nhs-notify-web-template-management-utils';

type PreviewTemplateHeadingsType =
  | 'Id'
  | 'Heading'
  | 'Body text'
  | 'Subject'
  | 'Message';

export type PreviewTemplateDetailsProps = {
  template: Template;
  templateTypeText: string;
  additionalMetaFields?: {
    title: string;
    id: string;
    content: React.ReactElement;
  }[];
  contentPreview?: {
    heading: PreviewTemplateHeadingsType;
    id: string;
    value: string;
  }[];
};

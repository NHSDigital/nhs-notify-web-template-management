import { Template } from 'nhs-notify-web-template-management-utils';

type PreviewTemplateHeadingsType =
  | 'Id'
  | 'Heading'
  | 'Body text'
  | 'Subject'
  | 'Message';

export type PreviewTemplateProps = {
  template: Template;
  previewContent?: {
    heading: PreviewTemplateHeadingsType;
    id: string;
    value: string;
  }[];
};

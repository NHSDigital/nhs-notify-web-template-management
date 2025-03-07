import { TemplateDto } from 'nhs-notify-backend-client';

type PreviewTemplateHeadingsType =
  | 'Id'
  | 'Heading'
  | 'Body text'
  | 'Subject'
  | 'Message';

export type PreviewTemplateDetailsProps = {
  template: TemplateDto;
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

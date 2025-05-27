import { TemplateDto } from 'nhs-notify-backend-client';

type PreviewTemplateHeadingsType =
  | 'Id'
  | 'Heading'
  | 'Body text'
  | 'Subject'
  | 'Message';

export type ContentPreviewField = {
  heading: PreviewTemplateHeadingsType;
  id: string;
  value: string;
};

export type PreviewTemplateDetailsProps = {
  template: TemplateDto;
  children: React.ReactNode;
};

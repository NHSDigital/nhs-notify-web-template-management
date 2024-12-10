type PreviewTemplateHeadingsType =
  | 'Heading'
  | 'Body text'
  | 'Subject'
  | 'Message';

export type PreviewTemplateProps = {
  preview: {
    heading: PreviewTemplateHeadingsType;
    id: string;
    value: string;
  }[];
};

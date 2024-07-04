type PreviewTemplateHeadingsType =
  | 'Heading'
  | 'Body text'
  | 'Subject'
  | 'Message';

export type PreviewTemplateProps = {
  preview: {
    heading: PreviewTemplateHeadingsType;
    value: string;
  }[];
};

import { MarkdownItWrapper } from '@utils/markdownit';

export type Dependencies = {
  markdownClient: MarkdownItWrapper;
};

export interface IPreviewEmailActions {
  renderMarkdown(value: string): string;
  formAction(value: string): void;
}

export type PreviewEmailProps = {
  templateName: string;
  subject: string;
  message: string;
  pageActions: IPreviewEmailActions;
};

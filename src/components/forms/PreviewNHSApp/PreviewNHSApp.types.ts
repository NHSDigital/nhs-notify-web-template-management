import { MarkdownItWrapper } from '@utils/markdownit';

export type Dependencies = {
  markdownClient: MarkdownItWrapper;
};

export interface IPreviewNHSAppActions {
  renderMarkdown(value: string): string;
}

export type PreviewNHSAppProps = {
  templateName: string;
  message: string;
  pageActions: IPreviewNHSAppActions;
};

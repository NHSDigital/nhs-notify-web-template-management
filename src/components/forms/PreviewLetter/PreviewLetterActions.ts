import { MarkdownItWrapper } from '@utils/markdownit';
import { Dependencies, IPreviewLetterActions } from './PreviewLetter.types';

export class PreviewLetterActions implements IPreviewLetterActions {
  private readonly _markdownClient: MarkdownItWrapper;

  constructor(
    _container: Dependencies = { markdownClient: new MarkdownItWrapper() }
  ) {
    this._markdownClient = _container.markdownClient
      .enableLineBreak()
      .enablePageBreak()
      .enable(['heading', 'list', 'emphasis']);
  }

  renderMarkdown(value: string) {
    'use server';
    return this._markdownClient.render(value);
  }
}

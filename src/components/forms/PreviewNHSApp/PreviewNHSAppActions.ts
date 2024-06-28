import { MarkdownItWrapper } from '@utils/markdownit';
import { Dependencies, IPreviewNHSAppActions } from './PreviewNHSApp.types';

export class PreviewNHSAppActions implements IPreviewNHSAppActions {
  private readonly _markdownClient: MarkdownItWrapper;

  constructor(
    _container: Dependencies = { markdownClient: new MarkdownItWrapper() }
  ) {
    this._markdownClient = _container.markdownClient
      .enableLineBreak()
      .enable(['heading', 'link', 'list', 'emphasis']);
  }

  renderMarkdown(value: string) {
    'use server';
    return this._markdownClient.render(value);
  }
}

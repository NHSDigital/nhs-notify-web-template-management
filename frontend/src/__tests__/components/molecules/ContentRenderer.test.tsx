import { render, screen } from '@testing-library/react';
import {
  ContentRenderer,
  ContentBlock,
  ContentItem,
} from '@molecules/ContentRenderer/ContentRenderer';

describe('ContentRenderer', () => {
  it('renders nothing for empty content array', () => {
    const content = [] as ContentBlock[];

    const { container } = render(<ContentRenderer content={content} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('throws an error for an unsupported block type', () => {
    const invalidContent = [
      { type: 'test', value: 'invalid' },
    ] as unknown as ContentBlock[];

    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => render(<ContentRenderer content={invalidContent} />)).toThrow(
      new Error('Unsupported content block type')
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Unsupported content block:',
      expect.objectContaining({ type: 'test' })
    );

    consoleErrorSpy.mockRestore();
  });

  it('renders text blocks using MarkdownContent', () => {
    const content: ContentBlock[] = [
      { type: 'text', text: 'This is a paragraph.' },
      { type: 'text', text: 'Another paragraph.' },
    ];

    render(<ContentRenderer content={content} />);

    const listItems = screen.getAllByRole('paragraph');
    expect(listItems).toHaveLength(2);
    expect(screen.getByText('This is a paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Another paragraph.')).toBeInTheDocument();
  });

  it('renders an inline-text block without a paragraph wrapper', () => {
    const content: ContentBlock[] = [
      { type: 'inline-text', text: 'Inline content' },
    ];

    render(
      <ul>
        <li data-testid='list-item'>
          <ContentRenderer content={content} />
        </li>
      </ul>
    );

    const listItem = screen.getByTestId('list-item');
    expect(listItem).toHaveTextContent('Inline content');
    expect(listItem.querySelector('p')).toBeNull();
  });

  it('treats a string as inline text (no paragraph wrapper)', () => {
    const content: string = 'Inline via string';

    render(
      <ul>
        <li data-testid='list-item'>
          <ContentRenderer content={content} />
        </li>
      </ul>
    );

    const listItem = screen.getByTestId('list-item');
    expect(listItem).toHaveTextContent('Inline via string');
    expect(listItem.querySelector('p')).toBeNull();
  });

  it('treats a string array as inline text (no paragraph wrapper)', () => {
    const content: ContentItem[] = ['Inline via string'];

    render(
      <ul>
        <li data-testid='list-item'>
          <ContentRenderer content={content} />
        </li>
      </ul>
    );

    const listItem = screen.getByTestId('list-item');
    expect(listItem).toHaveTextContent('Inline via string');
    expect(listItem.querySelector('p')).toBeNull();
  });

  it('renders code blocks with accessible description', () => {
    const content: ContentBlock[] = [
      {
        type: 'code',
        code: '# This is a heading',
        aria: {
          text: 'An example of heading markdown',
          id: 'heading-markdown-description',
        },
      },
    ];

    render(<ContentRenderer content={content} />);

    const hiddenText = screen.getByText('An example of heading markdown');
    expect(hiddenText).toHaveAttribute('id', 'heading-markdown-description');

    const code = screen.getByText('# This is a heading');
    expect(code).toHaveAttribute(
      'aria-describedby',
      'heading-markdown-description'
    );
  });

  it('renders list blocks', () => {
    const content: ContentBlock[] = [
      {
        type: 'list',
        items: ['Item 1', 'Item 2', 'Item 3'],
      },
    ];

    render(<ContentRenderer content={content} />);
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
    expect(listItems[0]).toHaveTextContent('Item 1');
    expect(listItems[1]).toHaveTextContent('Item 2');
    expect(listItems[2]).toHaveTextContent('Item 3');
  });
});

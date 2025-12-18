import { render, screen } from '@testing-library/react';
import {
  ContentRenderer,
  ContentBlock,
  ContentItem,
} from '@molecules/ContentRenderer/ContentRenderer';
import { markdownList } from '@utils/markdown-list';

describe('ContentRenderer', () => {
  it('renders nothing for empty content array', () => {
    const content = [] as ContentBlock[];

    const { container } = render(<ContentRenderer content={content} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a plain string as MarkdownContent in inline mode', () => {
    const container = render(<ContentRenderer content='Just a string block' />);
    expect(container.asFragment()).toMatchSnapshot();
    expect(screen.getByText('Just a string block')).toBeInTheDocument();
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

    const container = render(<ContentRenderer content={content} />);

    expect(container.asFragment()).toMatchSnapshot();

    const listItems = screen.getAllByRole('paragraph');
    expect(listItems).toHaveLength(2);
    expect(screen.getByText('This is a paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Another paragraph.')).toBeInTheDocument();
  });

  it('renders an inline-text block without a paragraph wrapper', () => {
    const content: ContentBlock[] = [
      { type: 'inline-text', text: 'Inline content' },
    ];

    const container = render(
      <ul>
        <li data-testid='list-item'>
          <ContentRenderer content={content} />
        </li>
      </ul>
    );

    expect(container.asFragment()).toMatchSnapshot();

    const listItem = screen.getByTestId('list-item');
    expect(listItem).toHaveTextContent('Inline content');
    expect(listItem.querySelector('p')).toBeNull();
  });

  it('treats a string as inline text (no paragraph wrapper)', () => {
    const content: string = 'Inline via string';

    const container = render(
      <ul>
        <li data-testid='list-item'>
          <ContentRenderer content={content} />
        </li>
      </ul>
    );

    expect(container.asFragment()).toMatchSnapshot();

    const listItem = screen.getByTestId('list-item');
    expect(listItem).toHaveTextContent('Inline via string');
    expect(listItem.querySelector('p')).toBeNull();
  });

  it('treats a string array as inline text (no paragraph wrapper)', () => {
    const content: ContentItem[] = ['Inline via string'];

    const container = render(
      <ul>
        <li data-testid='list-item'>
          <ContentRenderer content={content} />
        </li>
      </ul>
    );

    expect(container.asFragment()).toMatchSnapshot();

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

    const container = render(<ContentRenderer content={content} />);

    expect(container.asFragment()).toMatchSnapshot();

    const hiddenText = screen.getByText('An example of heading markdown');
    expect(hiddenText).toHaveAttribute('id', 'heading-markdown-description');

    const code = screen.getByText('# This is a heading');
    expect(code).toHaveAttribute(
      'aria-describedby',
      'heading-markdown-description'
    );
  });

  it('renders unordered list blocks', () => {
    const content: ContentBlock[] = [
      {
        type: 'text',
        text: markdownList('ul', ['Item 1', 'Item 2', 'Item 3']),
      },
    ];

    const container = render(<ContentRenderer content={content} />);

    expect(container.asFragment()).toMatchSnapshot();

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
    expect(listItems[0]?.parentElement?.tagName).toBe('UL');
    expect(listItems[0]).toHaveTextContent('Item 1');
    expect(listItems[1]).toHaveTextContent('Item 2');
    expect(listItems[2]).toHaveTextContent('Item 3');
  });

  it('renders ordered list blocks', () => {
    const content: ContentBlock[] = [
      {
        type: 'text',
        text: markdownList('ol', ['Item 1', 'Item 2', 'Item 3']),
      },
    ];

    const container = render(<ContentRenderer content={content} />);

    expect(container.asFragment()).toMatchSnapshot();

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
    expect(listItems[0]?.parentElement?.tagName).toBe('OL');
    expect(listItems[0]).toHaveTextContent('Item 1');
    expect(listItems[1]).toHaveTextContent('Item 2');
    expect(listItems[2]).toHaveTextContent('Item 3');
  });

  it('renders with overrides on text blocks', () => {
    const content: ContentBlock[] = [
      {
        type: 'text',
        text: 'This is a paragraph.',
        overrides: { p: { props: { className: 'foo' } } },
      },
      {
        type: 'text',
        text: 'Another paragraph.',
        overrides: { p: { props: { className: 'bar' } } },
      },
    ];

    const container = render(<ContentRenderer content={content} />);

    expect(container.asFragment()).toMatchSnapshot();

    const paragraphs = screen.getAllByRole('paragraph');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toHaveClass('foo');
    expect(paragraphs[1]).toHaveClass('bar');
  });

  it('renders with overrides on inline-text blocks', () => {
    const content: ContentBlock[] = [
      {
        type: 'inline-text',
        text: 'This is a [link](https://example.com).',
        overrides: { a: { props: { className: 'foo' } } },
      },
    ];

    const container = render(<ContentRenderer content={content} />);

    expect(container.asFragment()).toMatchSnapshot();

    const link = screen.getByRole('link');
    expect(link).toHaveClass('foo');
  });
});

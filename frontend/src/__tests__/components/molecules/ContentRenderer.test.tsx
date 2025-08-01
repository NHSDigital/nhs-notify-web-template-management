import { render, screen } from '@testing-library/react';
import {
  ContentRenderer,
  ContentBlock,
} from '@molecules/ContentRenderer/ContentRenderer';

describe('ContentRenderer', () => {
  it('renders nothing for empty content array', () => {
    const content = [] as ContentBlock[];

    const { container } = render(<ContentRenderer content={content} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing for unsupported block types', () => {
    const content = [
      { type: 'test', value: 'invalid' },
    ] as unknown as ContentBlock[];

    const { container } = render(<ContentRenderer content={content} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders text blocks using MarkdownContent', () => {
    const content: ContentBlock[] = [
      { type: 'text', text: 'This is a paragraph.' },
      { type: 'text', text: 'Another paragraph.' },
    ];

    render(<ContentRenderer content={content} />);
    expect(screen.getByText('This is a paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Another paragraph.')).toBeInTheDocument();
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

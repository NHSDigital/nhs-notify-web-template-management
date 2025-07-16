import React from 'react';
import { render, screen } from '@testing-library/react';
import { MarkdownContent } from '@molecules/MarkdownContent/MarkdownContent';

describe('MarkdownContent', () => {
  it('renders nothing if segments is empty array', () => {
    const { container } = render(<MarkdownContent segments={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders multiple segments in correct order', () => {
    const segments = ['First paragraph', 'Second [link](https://example.com)'];

    render(<MarkdownContent segments={segments} />);

    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://example.com'
    );
    expect(screen.getByRole('link')).toHaveTextContent('link');
  });

  it('adds correct attributes to links', () => {
    const segments = ['Click [here](https://example.com)'];

    render(<MarkdownContent segments={segments} />);

    const link = screen.getByRole('link', { name: 'here' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders markdown paragraphs and links correctly (snapshot)', () => {
    const segments = [
      'This is a paragraph',
      'Here is a [link](https://example.com)',
    ];

    const container = render(<MarkdownContent segments={segments} />);
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('escapes dangerous HTML, scripts, and iframes', () => {
    const segments = [
      '<script>alert("hacked!")</script>',
      '<img src=x onerror=alert(1)>',
      '<iframe src="https://malicious-site.com"></iframe>',
    ];

    const { container } = render(<MarkdownContent segments={segments} />);

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
  });
});

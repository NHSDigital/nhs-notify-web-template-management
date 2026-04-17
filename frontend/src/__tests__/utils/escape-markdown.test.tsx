import { render, screen } from '@testing-library/react';
import Markdown from 'markdown-to-jsx';
import { escapeMarkdown } from '@utils/escape-markdown';

describe('escapeMarkdown', () => {
  test('escapes underscores', () => {
    const input = 'address_line_1';

    const { rerender } = render(<Markdown>{input}</Markdown>);

    expect(screen.getByRole('emphasis').textContent).toEqual('line');

    const escaped = escapeMarkdown(input);

    expect(escaped).toBe(String.raw`address\_line\_1`);

    rerender(<Markdown>{escaped}</Markdown>);

    expect(screen.queryByRole('emphasis')).not.toBeInTheDocument();
    expect(screen.getByText(input)).toBeInTheDocument();
  });

  test('escapes asterisks', () => {
    const input = 'this is some **bold** text';

    const { rerender } = render(<Markdown>{input}</Markdown>);

    expect(screen.getByRole('strong').textContent).toEqual('bold');

    const escaped = escapeMarkdown(input);

    expect(escaped).toBe(String.raw`this is some \*\*bold\*\* text`);

    rerender(<Markdown>{escaped}</Markdown>);

    expect(screen.queryByRole('strong')).not.toBeInTheDocument();
    expect(screen.getByText(input)).toBeInTheDocument();
  });

  test('escapes backticks', () => {
    const input = 'this is some `code` text';

    const { rerender } = render(<Markdown>{input}</Markdown>);

    expect(screen.getByRole('code').textContent).toEqual('code');

    const escaped = escapeMarkdown(input);

    expect(escaped).toBe(String.raw`this is some \`code\` text`);

    rerender(<Markdown>{escaped}</Markdown>);

    expect(screen.queryByRole('code')).not.toBeInTheDocument();
    expect(screen.getByText(input)).toBeInTheDocument();
  });

  test('escapes square brackets and parentheses', () => {
    const input = '[link text](url)';

    const { rerender } = render(<Markdown>{input}</Markdown>);

    expect(screen.getByRole('link', { name: 'link text' })).toHaveAttribute(
      'href',
      'url'
    );

    const escaped = escapeMarkdown(input);

    expect(escaped).toBe(String.raw`\[link text\]\(url\)`);

    rerender(<Markdown>{escaped}</Markdown>);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText(input)).toBeInTheDocument();
  });

  test('escapes hash symbols', () => {
    const input = '# Heading';

    const { rerender } = render(<Markdown>{input}</Markdown>);

    expect(screen.getByRole('heading', { level: 1 }).textContent).toEqual(
      'Heading'
    );

    const escaped = escapeMarkdown(input);

    expect(escaped).toBe(String.raw`\# Heading`);

    rerender(<Markdown>{escaped}</Markdown>);

    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.getByText(input)).toBeInTheDocument();
  });

  test('escapes hyphens', () => {
    const input = '---';

    const { rerender } = render(<Markdown>{input}</Markdown>);

    expect(screen.getByRole('separator')).toBeInTheDocument();

    const escaped = escapeMarkdown(input);

    expect(escaped).toBe(String.raw`\-\-\-`);

    rerender(<Markdown>{escaped}</Markdown>);

    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
    expect(screen.getByText(input)).toBeInTheDocument();
  });

  test('escapes dots', () => {
    const input = '1. list item';

    const { rerender } = render(
      <Markdown options={{ forceBlock: true }}>{input}</Markdown>
    );

    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('listitem').textContent).toEqual('list item');

    const escaped = escapeMarkdown(input);

    expect(escaped).toBe(String.raw`1\. list item`);

    rerender(<Markdown options={{ forceBlock: true }}>{escaped}</Markdown>);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.getByText(input)).toBeInTheDocument();
  });

  test('escapes exclamation marks', () => {
    const input = '![alt text](image.jpg)';

    const { rerender } = render(<Markdown>{input}</Markdown>);

    const image = screen.getByRole('img', { name: 'alt text' });
    expect(image).toHaveAttribute('src', 'image.jpg');

    const escaped = escapeMarkdown(input);

    expect(escaped).toBe(String.raw`\!\[alt text\]\(image\.jpg\)`);

    rerender(<Markdown>{escaped}</Markdown>);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(screen.getByText(input)).toBeInTheDocument();
  });

  test('escapes pipe symbols', () => {
    const input = `| Col 1 | Col 2 |
|-------|-------|
| A     | B     |`;

    const { rerender } = render(
      <Markdown options={{ forceBlock: true }}>{input}</Markdown>
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Col 1' })
    ).toBeInTheDocument();

    const escaped = escapeMarkdown(input);

    rerender(<Markdown options={{ forceBlock: true }}>{escaped}</Markdown>);

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('paragraph').textContent).toEqual(
      input.replaceAll('/n', '')
    );
  });

  test('escapes backslashes', () => {
    const input = String.raw`\*not bold\*`;

    const { rerender } = render(<Markdown>{input}</Markdown>);

    expect(screen.getByText('*not bold*')).toBeInTheDocument();

    const escaped = escapeMarkdown(input);

    expect(escaped).toBe(String.raw`\\\*not bold\\\*`);

    rerender(<Markdown>{escaped}</Markdown>);

    expect(screen.getByText(input)).toBeInTheDocument();
  });
});

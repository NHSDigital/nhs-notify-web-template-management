import { render, screen } from '@testing-library/react';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';

const componentProps = {
  template: 'SMS' as const,
};

describe('MessageFormatting component', () => {
  it('renders component correctly with SMS related formatting', () => {
    render(<MessageFormatting {...componentProps} />);

    expect(screen.getByTestId('message-formatting-header')).toHaveTextContent(
      'Message formatting'
    );
    expect(screen.getByTestId('link-and-url-details')).toBeInTheDocument();
  });

  it('renders component correctly with APP related formatting', () => {
    const appFormattingProps = {
      ...componentProps,
      template: 'NHS_APP' as const,
    };
    render(<MessageFormatting {...appFormattingProps} />);

    expect(screen.getByTestId('message-formatting-header')).toHaveTextContent(
      'Message formatting'
    );
    expect(
      screen.getByTestId('lines-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
    expect(screen.getByTestId('headings-details')).toBeInTheDocument();
    expect(screen.getByTestId('bold-text-details')).toBeInTheDocument();
    expect(screen.getByTestId('link-and-url-details')).toBeInTheDocument();
  });

  it('renders component correctly with EMAIL related formatting', () => {
    const emailFormattingProps = {
      ...componentProps,
      template: 'EMAIL' as const,
    };
    render(<MessageFormatting {...emailFormattingProps} />);

    expect(screen.getByTestId('message-formatting-header')).toHaveTextContent(
      'Message formatting'
    );
    expect(
      screen.getByTestId('lines-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
    expect(screen.getByTestId('headings-details')).toBeInTheDocument();
    expect(screen.getByTestId('bullet-lists-details')).toBeInTheDocument();
    expect(screen.getByTestId('numbered-list-details')).toBeInTheDocument();
    expect(screen.getByTestId('horizontal-lines-details')).toBeInTheDocument();
    expect(screen.getByTestId('link-and-url-details')).toBeInTheDocument();
  });
});

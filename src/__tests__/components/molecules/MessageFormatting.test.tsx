import { render, screen } from '@testing-library/react';
import { MessageFormatting } from '@molecules/MessageFormatting/MessageFormatting';
import { MessageFormattingType } from '@molecules/MessageFormatting/message-formatting.types';
import { TemplateFormatText } from '@utils/types';

const componentProps: MessageFormattingType = {
  template: TemplateFormatText.SMS,
};

describe('MessageFormatting component', () => {
  it('renders component correctly with SMS related formatting', () => {
    render(<MessageFormatting {...componentProps} />);

    expect(screen.getByTestId('link-and-url-details')).toBeInTheDocument();
    expect(
      screen.getByTestId('lines-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
  });

  it('renders component correctly with APP related formatting', () => {
    const appFormattingProps: MessageFormattingType = {
      ...componentProps,
      template: TemplateFormatText.APP,
    };
    render(<MessageFormatting {...appFormattingProps} />);

    expect(screen.getByTestId('link-and-url-details')).toBeInTheDocument();
    expect(screen.getByTestId('bold-text-details')).toBeInTheDocument();
    expect(
      screen.getByTestId('lines-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
  });

  it('renders component correctly with EMAIL related formatting', () => {
    const emailFormattingProps: MessageFormattingType = {
      ...componentProps,
      template: TemplateFormatText.EMAIL,
    };
    render(<MessageFormatting {...emailFormattingProps} />);

    expect(screen.getByTestId('link-and-url-details')).toBeInTheDocument();
    expect(screen.getByTestId('bold-text-details')).toBeInTheDocument();
    expect(
      screen.getByTestId('lines-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
    expect(screen.getByTestId('headings-details')).toBeInTheDocument();
    expect(screen.getByTestId('bullet-lists-details')).toBeInTheDocument();
    expect(screen.getByTestId('numbered-list-details')).toBeInTheDocument();
    expect(screen.getByTestId('signatures-details')).toBeInTheDocument();
    expect(screen.getByTestId('horizontal-lines-details')).toBeInTheDocument();
  });

  it('renders component correctly with LETTER related formatting', () => {
    const letterFormattingProps: MessageFormattingType = {
      ...componentProps,
      template: TemplateFormatText.LETTER,
    };
    render(<MessageFormatting {...letterFormattingProps} />);

    expect(screen.getByTestId('link-and-url-details')).toBeInTheDocument();
    expect(screen.getByTestId('bold-text-details')).toBeInTheDocument();
    expect(
      screen.getByTestId('lines-breaks-and-paragraphs-details')
    ).toBeInTheDocument();
    expect(screen.getByTestId('headings-details')).toBeInTheDocument();
    expect(screen.getByTestId('bullet-lists-details')).toBeInTheDocument();
    expect(screen.getByTestId('numbered-list-details')).toBeInTheDocument();
    expect(screen.getByTestId('signatures-details')).toBeInTheDocument();
    expect(screen.getByTestId('horizontal-lines-details')).toBeInTheDocument();
    expect(screen.getByTestId('page-breaks-details')).toBeInTheDocument();
    expect(screen.getByTestId('content-blocks-details')).toBeInTheDocument();
  });
});
